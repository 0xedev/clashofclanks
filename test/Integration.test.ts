import { expect } from "chai";
import hre from "hardhat";

describe("Integration Tests", function () {
  it("Should deploy all contracts together", async function () {
    const [owner] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("1000000000");
    
    // Deploy COC Token
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    await cocToken.waitForDeployment();
    
    // Deploy Battle Manager
    const BattleManager = await hre.ethers.getContractFactory("BattleManager");
    const battleManager = await BattleManager.deploy(
      await cocToken.getAddress(),
      await cocToken.getAddress()
    );
    await battleManager.waitForDeployment();
    
    // Deploy Betting Pool
    const BettingPool = await hre.ethers.getContractFactory("BettingPool");
    const bettingPool = await BettingPool.deploy(
      await battleManager.getAddress(),
      await cocToken.getAddress(),
      hre.ethers.parseEther("1")
    );
    await bettingPool.waitForDeployment();
    
    // Deploy Staking Pool
    const StakingPool = await hre.ethers.getContractFactory("StakingPool");
    const stakingPool = await StakingPool.deploy(
      await cocToken.getAddress(),
      await cocToken.getAddress()
    );
    await stakingPool.waitForDeployment();
    
    expect(await cocToken.owner()).to.equal(owner.address);
    expect(await battleManager.owner()).to.equal(owner.address);
    expect(await bettingPool.owner()).to.equal(owner.address);
    expect(await stakingPool.owner()).to.equal(owner.address);
  });

  it("Should configure contracts together", async function () {
    const [owner] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("1000000000");
    
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    const BattleManager = await hre.ethers.getContractFactory("BattleManager");
    const battleManager = await BattleManager.deploy(
      await cocToken.getAddress(),
      await cocToken.getAddress()
    );
    
    const BettingPool = await hre.ethers.getContractFactory("BettingPool");
    const bettingPool = await BettingPool.deploy(
      await battleManager.getAddress(),
      await cocToken.getAddress(),
      hre.ethers.parseEther("1")
    );
    
    // Configure
    await battleManager.setBettingPool(await bettingPool.getAddress());
    await cocToken.setExemption(await bettingPool.getAddress(), true);
    await cocToken.enableTrading();
    
    expect(await battleManager.bettingPool()).to.equal(await bettingPool.getAddress());
    expect(await cocToken.tradingEnabled()).to.equal(true);
  });
});
