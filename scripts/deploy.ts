import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Clash of Clanks contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Configuration
  const CLINKERS_NFT_ADDRESS = "0x59df628ab3478e0A1E221c327BF6e08BD5D57B23";
  const INITIAL_COC_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens
  const MIN_BET_AMOUNT = ethers.parseEther("1"); // 1 COC minimum bet
  
  // Chainlink configuration for Base mainnet
  const LINK_TOKEN = "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196"; // Base LINK
  const ORACLE_ADDRESS = "0x"; // Update with actual Chainlink oracle
  const JOB_ID = ethers.encodeBytes32String(""); // Update with actual job ID
  const ORACLE_FEE = ethers.parseEther("0.1"); // 0.1 LINK per request

  // 1. Deploy COC Token
  console.log("\n📄 Deploying COC Token...");
  const COCToken = await ethers.getContractFactory("COCToken");
  const cocToken = await COCToken.deploy(INITIAL_COC_SUPPLY);
  await cocToken.waitForDeployment();
  const cocTokenAddress = await cocToken.getAddress();
  console.log("✅ COC Token deployed to:", cocTokenAddress);

  // 2. Deploy Battle Manager
  console.log("\n⚔️  Deploying Battle Manager...");
  const BattleManager = await ethers.getContractFactory("BattleManager");
  const battleManager = await BattleManager.deploy(
    CLINKERS_NFT_ADDRESS,
    cocTokenAddress
  );
  await battleManager.waitForDeployment();
  const battleManagerAddress = await battleManager.getAddress();
  console.log("✅ Battle Manager deployed to:", battleManagerAddress);

  // 3. Deploy Betting Pool
  console.log("\n💰 Deploying Betting Pool...");
  const BettingPool = await ethers.getContractFactory("BettingPool");
  const bettingPool = await BettingPool.deploy(
    battleManagerAddress,
    cocTokenAddress,
    MIN_BET_AMOUNT
  );
  await bettingPool.waitForDeployment();
  const bettingPoolAddress = await bettingPool.getAddress();
  console.log("✅ Betting Pool deployed to:", bettingPoolAddress);

  // 4. Deploy Staking Pool
  console.log("\n🎁 Deploying Staking Pool...");
  const StakingPool = await ethers.getContractFactory("StakingPool");
  const stakingPool = await StakingPool.deploy(
    cocTokenAddress,
    CLINKERS_NFT_ADDRESS
  );
  await stakingPool.waitForDeployment();
  const stakingPoolAddress = await stakingPool.getAddress();
  console.log("✅ Staking Pool deployed to:", stakingPoolAddress);

  // 5. Deploy Oracle (if on mainnet with Chainlink)
  let oracleAddress = ethers.ZeroAddress;
  if (ORACLE_ADDRESS !== "0x") {
    console.log("\n🔮 Deploying Token Metrics Oracle...");
    const TokenMetricsOracle = await ethers.getContractFactory("TokenMetricsOracle");
    const oracle = await TokenMetricsOracle.deploy(
      LINK_TOKEN,
      ORACLE_ADDRESS,
      JOB_ID,
      ORACLE_FEE
    );
    await oracle.waitForDeployment();
    oracleAddress = await oracle.getAddress();
    console.log("✅ Token Metrics Oracle deployed to:", oracleAddress);
  } else {
    console.log("\n⚠️  Skipping Oracle deployment (configure Chainlink first)");
  }

  // 6. Configure contracts
  console.log("\n⚙️  Configuring contracts...");
  
  // Set betting pool in battle manager
  await battleManager.setBettingPool(bettingPoolAddress);
  console.log("✅ Betting pool set in Battle Manager");
  
  // Set staking contract in betting pool
  await bettingPool.setStakingContract(stakingPoolAddress);
  console.log("✅ Staking contract set in Betting Pool");
  
  if (oracleAddress !== ethers.ZeroAddress) {
    // Set oracle in battle manager
    await battleManager.setOracle(oracleAddress);
    console.log("✅ Oracle set in Battle Manager");
    
    // Set battle manager in oracle
    const oracle = await ethers.getContractAt("TokenMetricsOracle", oracleAddress);
    await oracle.setBattleManager(battleManagerAddress);
    console.log("✅ Battle Manager set in Oracle");
  }
  
  // Enable trading on COC token
  await cocToken.enableTrading();
  console.log("✅ Trading enabled on COC Token");
  
  // Set exemptions for platform contracts
  await cocToken.setExemption(battleManagerAddress, true);
  await cocToken.setExemption(bettingPoolAddress, true);
  await cocToken.setExemption(stakingPoolAddress, true);
  console.log("✅ Platform contracts exempted from trading restrictions");

  // 7. Summary
  console.log("\n📋 DEPLOYMENT SUMMARY");
  console.log("═".repeat(60));
  console.log("COC Token:            ", cocTokenAddress);
  console.log("Battle Manager:       ", battleManagerAddress);
  console.log("Betting Pool:         ", bettingPoolAddress);
  console.log("Staking Pool:         ", stakingPoolAddress);
  console.log("Token Metrics Oracle: ", oracleAddress === ethers.ZeroAddress ? "Not deployed" : oracleAddress);
  console.log("Clinkers NFT:         ", CLINKERS_NFT_ADDRESS);
  console.log("═".repeat(60));
  
  console.log("\n✅ Deployment complete!");
  console.log("\n📝 Update your .env file with these addresses");
  console.log("\n🔍 Verify contracts on Basescan:");
  console.log(`npx hardhat verify --network base ${cocTokenAddress} "${INITIAL_COC_SUPPLY}"`);
  console.log(`npx hardhat verify --network base ${battleManagerAddress} "${CLINKERS_NFT_ADDRESS}" "${cocTokenAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
