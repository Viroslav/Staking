// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
//const hre = require("hardhat");

async function main() {
  const RewardTokenAddress = "0xC47Fd6ec9bb45115e89E76aC914F6EEe19501c15";
  const reward_token = await hre.ethers.getContractAt("RewardToken", RewardTokenAddress);
    
  // const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  // const reward_token = await RewardToken.deploy();
  // await reward_token.deployed();
  // const RewardTokenAddress = reward_token.getOwnerAddress();
  console.log(`RewardToken deployed at the address ${RewardTokenAddress}`);


  const StakingTokenAddress = "0x84B96c82d4c5e68DD531a2b44d0fBcE9b19EB20e";
  const staking_token = await hre.ethers.getContractAt("StakingToken", StakingTokenAddress);

  // const StakingToken = await hre.ethers.getContractFactory("StakingToken");
  // const staking_token = await StakingToken.deploy();
  // await staking_token.deployed();
  // const StakingTokenAddress = await staking_token.getOwnerAddress();
  console.log(`StakingToken deployed at the address ${StakingTokenAddress}`);

  const Staking = await hre.ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(StakingTokenAddress, RewardTokenAddress);
  await staking.deployed();
  console.log(`Staking deployed`);
  const reward_per_token = await staking.rewardPerToken()
  console.log(`reward_per_token = ${reward_per_token}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});