// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title StakingPool
 * @notice Staking mechanism for $COC tokens and @clinkers NFTs
 */
contract StakingPool is Ownable, ReentrancyGuard {
    
    /// @notice Stake information
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lastClaimTime;
        uint256 votingPower;
    }
    
    /// @notice NFT stake information
    struct NFTStake {
        uint256 tokenId;
        uint256 timestamp;
        uint256 lastClaimTime;
        uint256 votingPower;
    }
    
    /// @notice COC token
    IERC20 public cocToken;
    
    /// @notice Clinkers NFT
    IERC721 public clinkersNFT;
    
    /// @notice Total COC staked
    uint256 public totalCOCStaked;
    
    /// @notice Total NFTs staked
    uint256 public totalNFTsStaked;
    
    /// @notice Reward pool balance
    uint256 public rewardPool;
    
    /// @notice User COC stakes
    mapping(address => Stake) public stakes;
    
    /// @notice User NFT stakes
    mapping(address => NFTStake[]) public nftStakes;
    
    /// @notice NFT token ID to owner
    mapping(uint256 => address) public nftStakeOwner;
    
    /// @notice Total voting power
    uint256 public totalVotingPower;
    
    /// @notice Reward rate per second (in basis points)
    uint256 public rewardRatePerSecond = 1; // 0.01% per second
    
    /// Events
    event COCStaked(address indexed user, uint256 amount);
    event COCUnstaked(address indexed user, uint256 amount);
    event NFTStaked(address indexed user, uint256 tokenId);
    event NFTUnstaked(address indexed user, uint256 tokenId);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardPoolFunded(uint256 amount);
    
    /**
     * @notice Constructor
     */
    constructor(
        address _cocToken,
        address _clinkersNFT
    ) Ownable(msg.sender) {
        cocToken = IERC20(_cocToken);
        clinkersNFT = IERC721(_clinkersNFT);
    }
    
    /**
     * @notice Stake COC tokens
     */
    function stakeCOC(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot stake 0");
        
        // Transfer tokens
        require(
            cocToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        // Claim pending rewards first
        if (stakes[msg.sender].amount > 0) {
            _claimCOCRewards(msg.sender);
        }
        
        // Update stake
        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].lastClaimTime = block.timestamp;
        stakes[msg.sender].votingPower += _amount / 1000; // 1 voting power per 1000 tokens
        
        totalCOCStaked += _amount;
        totalVotingPower += _amount / 1000;
        
        emit COCStaked(msg.sender, _amount);
    }
    
    /**
     * @notice Unstake COC tokens
     */
    function unstakeCOC(uint256 _amount) external nonReentrant {
        require(stakes[msg.sender].amount >= _amount, "Insufficient stake");
        
        // Claim rewards first
        _claimCOCRewards(msg.sender);
        
        // Update stake
        stakes[msg.sender].amount -= _amount;
        uint256 votingPowerLoss = _amount / 1000;
        stakes[msg.sender].votingPower -= votingPowerLoss;
        
        totalCOCStaked -= _amount;
        totalVotingPower -= votingPowerLoss;
        
        // Transfer tokens back
        require(cocToken.transfer(msg.sender, _amount), "Transfer failed");
        
        emit COCUnstaked(msg.sender, _amount);
    }
    
    /**
     * @notice Stake NFT
     */
    function stakeNFT(uint256 _tokenId) external nonReentrant {
        require(clinkersNFT.ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        
        // Transfer NFT to contract
        clinkersNFT.transferFrom(msg.sender, address(this), _tokenId);
        
        // Create NFT stake
        nftStakes[msg.sender].push(NFTStake({
            tokenId: _tokenId,
            timestamp: block.timestamp,
            lastClaimTime: block.timestamp,
            votingPower: 10 // Each NFT = 10 voting power
        }));
        
        nftStakeOwner[_tokenId] = msg.sender;
        totalNFTsStaked++;
        totalVotingPower += 10;
        
        emit NFTStaked(msg.sender, _tokenId);
    }
    
    /**
     * @notice Unstake NFT
     */
    function unstakeNFT(uint256 _tokenId) external nonReentrant {
        require(nftStakeOwner[_tokenId] == msg.sender, "Not NFT staker");
        
        // Find and remove NFT stake
        NFTStake[] storage userNFTStakes = nftStakes[msg.sender];
        for (uint256 i = 0; i < userNFTStakes.length; i++) {
            if (userNFTStakes[i].tokenId == _tokenId) {
                // Claim rewards first
                _claimNFTRewards(msg.sender, i);
                
                // Remove stake
                userNFTStakes[i] = userNFTStakes[userNFTStakes.length - 1];
                userNFTStakes.pop();
                break;
            }
        }
        
        delete nftStakeOwner[_tokenId];
        totalNFTsStaked--;
        totalVotingPower -= 10;
        
        // Transfer NFT back
        clinkersNFT.transferFrom(address(this), msg.sender, _tokenId);
        
        emit NFTUnstaked(msg.sender, _tokenId);
    }
    
    /**
     * @notice Claim all rewards
     */
    function claimRewards() external nonReentrant {
        uint256 totalReward = 0;
        
        // Claim COC staking rewards
        if (stakes[msg.sender].amount > 0) {
            totalReward += _claimCOCRewards(msg.sender);
        }
        
        // Claim NFT staking rewards
        NFTStake[] storage userNFTStakes = nftStakes[msg.sender];
        for (uint256 i = 0; i < userNFTStakes.length; i++) {
            totalReward += _claimNFTRewards(msg.sender, i);
        }
        
        require(totalReward > 0, "No rewards");
        emit RewardsClaimed(msg.sender, totalReward);
    }
    
    /**
     * @notice Fund reward pool (called by betting pool with 5% of fees)
     */
    function fundRewardPool(uint256 _amount) external {
        require(
            cocToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        rewardPool += _amount;
        emit RewardPoolFunded(_amount);
    }
    
    /**
     * @notice Get pending rewards for user
     */
    function getPendingRewards(address _user) external view returns (uint256) {
        uint256 totalRewards = 0;
        
        // COC rewards
        if (stakes[_user].amount > 0) {
            uint256 timeStaked = block.timestamp - stakes[_user].lastClaimTime;
            totalRewards += (stakes[_user].amount * timeStaked * rewardRatePerSecond) / 10000;
        }
        
        // NFT rewards
        NFTStake[] storage userNFTStakes = nftStakes[_user];
        for (uint256 i = 0; i < userNFTStakes.length; i++) {
            uint256 timeStaked = block.timestamp - userNFTStakes[i].lastClaimTime;
            // NFT stakers get 2x rewards
            totalRewards += (stakes[_user].amount * timeStaked * rewardRatePerSecond * 2) / 10000;
        }
        
        return totalRewards;
    }
    
    /**
     * @notice Get user voting power
     */
    function getVotingPower(address _user) external view returns (uint256) {
        return stakes[_user].votingPower + (nftStakes[_user].length * 10);
    }
    
    /**
     * @dev Claim COC staking rewards
     */
    function _claimCOCRewards(address _user) internal returns (uint256) {
        Stake storage stake = stakes[_user];
        uint256 timeStaked = block.timestamp - stake.lastClaimTime;
        uint256 reward = (stake.amount * timeStaked * rewardRatePerSecond) / 10000;
        
        if (reward > 0 && reward <= rewardPool) {
            stake.lastClaimTime = block.timestamp;
            rewardPool -= reward;
            require(cocToken.transfer(_user, reward), "Reward transfer failed");
            return reward;
        }
        
        return 0;
    }
    
    /**
     * @dev Claim NFT staking rewards
     */
    function _claimNFTRewards(address _user, uint256 _index) internal returns (uint256) {
        NFTStake storage nftStake = nftStakes[_user][_index];
        uint256 timeStaked = block.timestamp - nftStake.lastClaimTime;
        
        // NFT holders get boosted rewards (2x)
        uint256 baseStake = stakes[_user].amount > 0 ? stakes[_user].amount : 1000 * 10**18;
        uint256 reward = (baseStake * timeStaked * rewardRatePerSecond * 2) / 10000;
        
        if (reward > 0 && reward <= rewardPool) {
            nftStake.lastClaimTime = block.timestamp;
            rewardPool -= reward;
            require(cocToken.transfer(_user, reward), "Reward transfer failed");
            return reward;
        }
        
        return 0;
    }
}
