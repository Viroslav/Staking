const Staking = artifacts.require('Staking')
const token1 = artifacts.require('StakingToken')
const token2 = artifacts.require('RewardToken')
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

contract('Staking', ([owner, user1, user2]) => {
  let staking, stakingToken, rewardsToken

  before(async () => {
    // Deploy mock ERC20 tokens
    stakingToken = await token1.new({ from: owner })
    rewardsToken = await token2.new({ from: owner })

    // Transfer some STK and RWD tokens to user1 and user2
    await stakingToken.transfer(user1, 100, { from: owner })
    await rewardsToken.transfer(user1, 100, { from: owner })
    await stakingToken.transfer(user2, 100, { from: owner })
    await rewardsToken.transfer(user2, 100, { from: owner })
  })

  describe('Staking', () => {
    it('should allow staking', async () => {
      const amount = 20
      const rewards = 20
      const duration = 5

      staking = await Staking.new(stakingToken.address, rewardsToken.address, { from: owner })
      await rewardsToken.transfer(staking.address, 1000, { from: owner })
      await staking.setRewardsDuration(duration, { from: owner })

      await stakingToken.approve(staking.address, amount, { from: user1 })
      await staking.stake(amount, { from: user1 })
      await staking.notifyRewardAmount(rewards, { from: owner })
      assert.equal(await staking.balanceOf(user1), amount)
      assert.equal(await staking.totalSupply(), amount)
    })

    it('should allow withdrawing', async () => {
      const amount = 20
      const rewards = 20
      const duration = 10

      staking = await Staking.new(stakingToken.address, rewardsToken.address, { from: owner })
      await rewardsToken.transfer(staking.address, 1000, { from: owner })
      await staking.setRewardsDuration(duration, { from: owner })
      
      await stakingToken.approve(staking.address, amount, { from: user1 })
      await staking.stake(amount, { from: user1 })
      assert.equal(await staking.balanceOf(user1), amount)
      assert.equal(await staking.totalSupply(), amount)

      await staking.notifyRewardAmount(rewards, { from: owner })
      await staking.getReward({ from: user1 })
      await rewardsToken.approve(staking.address, rewards, { from: user1 })
      await stakingToken.approve(staking.address, amount, { from: user1 })
      await staking.withdraw(amount, { from: user1 })
      assert.equal(await staking.balanceOf(user1), 0)
      assert.equal(await staking.totalSupply(), 0)
      //assert.equal(await rewardsToken.balanceOf(user1), rewards)
    })

    it('should update rewards', async () => {
      const amount1 = 20
      const amount2 = 30
      const rewards = 100
      const duration = 10

      staking = await Staking.new(stakingToken.address, rewardsToken.address, { from: owner })
      await rewardsToken.transfer(staking.address, 1000, { from: owner })
      await staking.setRewardsDuration(duration, { from: owner })

      await stakingToken.approve(staking.address, amount1, { from: user1 })
      await staking.stake(amount1, { from: user1 })
      assert.equal(await staking.balanceOf(user1), amount1)
      assert.equal(await staking.totalSupply(), amount1)

      await stakingToken.approve(staking.address, amount2, { from: user2 })
      await staking.stake(amount2, { from: user2 })
      assert.equal(await staking.balanceOf(user2), amount2)
      assert.equal(await staking.totalSupply(), amount1 + amount2)

      await staking.notifyRewardAmount(rewards, { from: owner })

      await mine();
      const rewardPerToken = await staking.rewardPerToken()
      assert.notEqual(rewardPerToken, 0)
    })

    it('should calculate earnings', async () => {
      const amount1 = 20
      const amount2 = 30
      const rewards = 100
      const duration = 10
      
      staking = await Staking.new(stakingToken.address, rewardsToken.address, { from: owner })
      await rewardsToken.transfer(staking.address, 1000, { from: owner })
      await staking.setRewardsDuration(duration, { from: owner })
      

  	  await stakingToken.approve(staking.address, amount1, { from: user1 })
  	  await staking.stake(amount1, { from: user1 })

      await stakingToken.approve(staking.address, amount2, { from: user2 })
  	  await staking.stake(amount2, { from: user2 })
      
      await staking.notifyRewardAmount(rewards, { from: owner })
  	  // Wait for some time to elapse for rewards to accrue
      await mine(duration / 2);
  	  earned1 = await staking.earned(user1)
      earned2 = await staking.earned(user2)

  	  assert.equal(earned1, (rewards/ 2) * amount1 / (amount1 + amount2))
      assert.equal(earned2, (rewards/ 2) * amount2 / (amount1 + amount2))

      await mine(duration / 2);
  	  earned1 = await staking.earned(user1)
      earned2 = await staking.earned(user2)

  	  assert.equal(earned1, rewards * amount1 / (amount1 + amount2))
      assert.equal(earned2, rewards * amount2 / (amount1 + amount2))
    })
  })
})