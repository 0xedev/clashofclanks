import { expect } from "chai";
import hre from "hardhat";

describe("BattleManager", function () {
  const ONE_WEEK = 7 * 24 * 60 * 60;
  const token1 = "0x1000000000000000000000000000000000000001";
  const token2 = "0x2000000000000000000000000000000000000002";

  it("Should deploy correctly", async function () {
    const [owner] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("1000000000");
    
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    const BattleManager = await hre.ethers.getContractFactory("BattleManager");
    const battleManager = await BattleManager.deploy(
      await cocToken.getAddress(),
      await cocToken.getAddress()
    );
    
    expect(await battleManager.owner()).to.equal(owner.address);
  });

  it("Should allow owner to create battle", async function () {
    const [owner, deployer1, deployer2] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("1000000000");
    
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    const BattleManager = await hre.ethers.getContractFactory("BattleManager");
    const battleManager = await BattleManager.deploy(
      await cocToken.getAddress(),
      await cocToken.getAddress()
    );
    
    await expect(
      battleManager.createBattle(
        token1,
        token2,
        deployer1.address,
        deployer2.address,
        ONE_WEEK,
        0, // Random theme
        false // Not spotlight
      )
    ).to.emit(battleManager, "BattleCreated");
  });

  it("Should not allow same token in battle", async function () {
    const [owner, deployer1, deployer2] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("1000000000");
    
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    const BattleManager = await hre.ethers.getContractFactory("BattleManager");
    const battleManager = await BattleManager.deploy(
      await cocToken.getAddress(),
      await cocToken.getAddress()
    );
    
    await expect(
      battleManager.createBattle(
        token1,
        token1, // Same token
        deployer1.address,
        deployer2.address,
        ONE_WEEK,
        0,
        false
      )
    ).to.be.revertedWith("Same token");
  });

  it("Should increment battle counter", async function () {
    const [owner, deployer1, deployer2] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("1000000000");
    
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    const BattleManager = await hre.ethers.getContractFactory("BattleManager");
    const battleManager = await BattleManager.deploy(
      await cocToken.getAddress(),
      await cocToken.getAddress()
    );
    
    await battleManager.createBattle(
      token1, token2, deployer1.address, deployer2.address, ONE_WEEK, 0, false
    );
    
    expect(await battleManager.battleCounter()).to.equal(1);
  });

  it("Should create checkpoints for battle", async function () {
    const [owner, deployer1, deployer2] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("1000000000");
    
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    const BattleManager = await hre.ethers.getContractFactory("BattleManager");
    const battleManager = await BattleManager.deploy(
      await cocToken.getAddress(),
      await cocToken.getAddress()
    );
    
    await battleManager.createBattle(
      token1, token2, deployer1.address, deployer2.address, ONE_WEEK, 0, false
    );
    
    const checkpoints = await battleManager.getBattleCheckpoints(1);
    expect(checkpoints.length).to.equal(6); // 1h, 12h, Day1, Day1.5, Day2, Final
  });

  it("Should allow oracle to complete battle", async function () {
    const [owner, deployer1, deployer2, oracle] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("1000000000");
    
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    const BattleManager = await hre.ethers.getContractFactory("BattleManager");
    const battleManager = await BattleManager.deploy(
      await cocToken.getAddress(),
      await cocToken.getAddress()
    );
    
    await battleManager.setOracle(oracle.address);
    await battleManager.createBattle(
      token1, token2, deployer1.address, deployer2.address, ONE_WEEK, 0, false
    );
    
    await expect(
      battleManager.connect(oracle).completeBattle(1, token1)
    ).to.emit(battleManager, "BattleCompleted").withArgs(1, token1);
  });
});
