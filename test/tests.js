const Staking = artifacts.require('Staking')
const token1 = artifacts.require('StakingToken')
const token2 = artifacts.require('RewardToken')

contract('Staking', ([owner, user1, user2]) => {
  let staking, stakingToken, rewardsToken

  before(async () => {
    // Deploy mock ERC20 tokens
    stakingToken = await token1.new({ from: owner })
    rewardsToken = await token2.new({ from: owner })

    // Deploy Staking contract
    staking = await Staking.new(stakingToken.address, rewardsToken.address, { from: owner })
    //await staking.RewardsDuration(10, { from: owner })

    // Transfer some STK and RWD tokens to user1 and user2
    await stakingToken.transfer(user1, 500, { from: owner })
    await rewardsToken.transfer(user1, 500, { from: owner })
    await stakingToken.transfer(user2, 500, { from: owner })
    await rewardsToken.transfer(user2, 500, { from: owner })
  })

  describe('Staking', () => {
    it('should allow staking', async () => {
      const amount = 100
      await stakingToken.approve(staking.address, amount, { from: user1 })
      await staking.stake(amount, { from: user1 })
      assert.equal(await staking.balanceOf(user1), amount)
      assert.equal(await staking.totalSupply(), amount)
    })

    it('should allow withdrawing', async () => {
      const amount = 50
      const rewards = 25
      await stakingToken.approve(staking.address, amount, { from: user1 })
      await staking.stake(amount, { from: user1 })
      assert.equal(await staking.balanceOf(user1), 150)
      assert.equal(await staking.totalSupply(), 150)

      await staking.getReward({ from: user1 })
      await rewardsToken.approve(staking.address, rewards, { from: user1 })
      await stakingToken.approve(staking.address, amount, { from: user1 })
      await staking.withdraw(amount, { from: user1 })
      assert.equal(await staking.balanceOf(user1), 100)
      assert.equal(await staking.totalSupply(), 100)
      //assert.equal(await rewardsToken.balanceOf(user1), rewards)
    })

    it('should update rewards', async () => {
      const amount1 = 50
      const amount2 = 100
      const rewards = 100
      await stakingToken.approve(staking.address, amount1, { from: user1 })
      await staking.stake(amount1, { from: user1 })
      assert.equal(await staking.balanceOf(user1), 150)
      assert.equal(await staking.totalSupply(), 150)

      await staking.notifyRewardAmount(rewards, { from: owner })
      await stakingToken.approve(staking.address, amount2, { from: user2 })
      await staking.stake(amount2, { from: user2 })
      assert.equal(await staking.balanceOf(user2), amount2)
      assert.equal(await staking.totalSupply(), amount1 + amount2)

      const rewardPerToken = await staking.rewardPerToken()
      assert.notEqual(rewardPerToken, 0)
    })

    it('should calculate earnings', async () => {
      const amount = 100
      const rewards = 50
      await staking
    })
  })
})
