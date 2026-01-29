import { expect } from "chai";
import hre from "hardhat";

describe("COCToken", function () {
  it("Should deploy with correct initial supply", async function () {
    const [owner] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("1000000000");
    
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    await cocToken.waitForDeployment();

    expect(await cocToken.totalSupply()).to.equal(initialSupply);
    expect(await cocToken.balanceOf(owner.address)).to.equal(initialSupply);
  });

  it("Should have correct name and symbol", async function () {
    const initialSupply = hre.ethers.parseEther("1000000000");
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    expect(await cocToken.name()).to.equal("Clash of Clanks");
    expect(await cocToken.symbol()).to.equal("COC");
  });

  it("Should not have trading enabled initially", async function () {
    const initialSupply = hre.ethers.parseEther("1000000000");
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    expect(await cocToken.tradingEnabled()).to.equal(false);
  });

  it("Should allow owner to enable trading", async function () {
    const initialSupply = hre.ethers.parseEther("1000000000");
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    await cocToken.enableTrading();
    expect(await cocToken.tradingEnabled()).to.equal(true);
  });

  it("Should not allow enabling trading twice", async function () {
    const initialSupply = hre.ethers.parseEther("1000000000");
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    await cocToken.enableTrading();
    await expect(cocToken.enableTrading()).to.be.revertedWith("Trading already enabled");
  });

  it("Should allow transfers when trading enabled", async function () {
    const [owner, user1] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("1000000000");
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    await cocToken.enableTrading();
    await cocToken.transfer(user1.address, hre.ethers.parseEther("1000"));
    
    expect(await cocToken.balanceOf(user1.address)).to.equal(hre.ethers.parseEther("1000"));
  });

  it("Should allow burning tokens", async function () {
    const initialSupply = hre.ethers.parseEther("1000000000");
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    const burnAmount = hre.ethers.parseEther("100");
    await cocToken.burn(burnAmount);
    
    expect(await cocToken.totalSupply()).to.equal(initialSupply - burnAmount);
  });

  it("Should allow owner to mint additional tokens", async function () {
    const [owner, user1] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("100000000"); // 100M instead of 1B
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    const mintAmount = hre.ethers.parseEther("1000");
    await cocToken.mint(user1.address, mintAmount);
    
    expect(await cocToken.balanceOf(user1.address)).to.equal(mintAmount);
  });

  it("Should not allow minting above max supply", async function () {
    const [owner, user1] = await hre.ethers.getSigners();
    const initialSupply = hre.ethers.parseEther("1000000000");
    const COCToken = await hre.ethers.getContractFactory("COCToken");
    const cocToken = await COCToken.deploy(initialSupply);
    
    const maxSupply = await cocToken.MAX_SUPPLY();
    const remainingMintable = maxSupply - initialSupply;
    
    await expect(
      cocToken.mint(user1.address, remainingMintable + hre.ethers.parseEther("1"))
    ).to.be.revertedWith("Exceeds max supply");
  });
});
