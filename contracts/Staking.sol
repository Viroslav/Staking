// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IERC20.sol";
import "hardhat/console.sol";

contract Staking {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    address public owner;

    // Duration of rewards to be paid out (in seconds)
    uint public duration;

    // Timestamp of when the rewards finish
    uint public finishAt;

    // Minimum of last updated time and reward finish time
    uint public updatedAt;

    // Reward to be paid out per second
    uint public rewardRate;

    // Sum of (reward rate * dt * 1e18 / total supply)
    uint public rewardPerTokenStored;

    // User address => rewardPerTokenStored 
    mapping(address => uint) public userRewardPerTokenPaid;

    // User address => rewards to be claimed
    mapping(address => uint) public rewards;

    // Total staked
    uint public totalSupply;

    // User address => staked amount
    mapping(address => uint) public balanceOf;

    constructor(address _stakingToken, address _rewardToken) {

        owner = msg.sender;
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardToken);
    }

    modifier onlyOwner() {
        // checker if the code was called by owner
        require(msg.sender == owner, "not authorized");
        _;
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = _min(finishAt, block.timestamp);

        if (_account != address(0)) {
            
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }

        _;
    }

    function setRewardsDuration(uint _duration) external onlyOwner {
        //  set a duration of rewards to be paid out
        require(finishAt < block.timestamp, "reward duration not finished");
        duration = _duration;
    }

    function notifyRewardAmount(uint _amount) external onlyOwner updateReward(address(0)) {
        // add an ammount of rewards
        if (block.timestamp >= finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint remainingRewards = (finishAt - block.timestamp) * rewardRate;
            rewardRate = (_amount + remainingRewards) / duration;
        }
        
        require(rewardRate > 0, "reward rate = 0");

        require(
            rewardRate * duration <= rewardsToken.balanceOf(address(this)),
            "reward amount > balance"
        );
        
        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;
    }

    function rewardPerToken() public view returns (uint) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }

        return rewardPerTokenStored + (_min(finishAt, block.timestamp) - updatedAt) * rewardRate * 1e18  / totalSupply;
    }

    function stake(uint _amount) external updateReward(msg.sender) {
        //function to stake your tokens
        require(_amount > 0, "amount = 0");
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        balanceOf[msg.sender] += _amount;
        totalSupply += _amount;
        console.log('User %o staked %o', msg.sender, _amount);
        console.log('Now total supply is %o', totalSupply);
    }

    function withdraw(uint _amount) external updateReward(msg.sender) {
        //function to take back your staked tokens
        require(_amount > 0, "amount = 0");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        stakingToken.transfer(msg.sender, _amount);
        console.log('User %o withdrawed %o money', msg.sender, _amount);
        console.log('Now total supply is %o', totalSupply);
    }

    function earned(address _account) public view returns (uint) {
        // show how much does account earn for current time
        console.log('Blocks mined: %o', _min(finishAt, block.timestamp) - updatedAt);
        console.log('User %o earned %o money', _account, ((balanceOf[_account] * (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) + rewards[_account]);
        return
            (
                (balanceOf[_account] * (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18
            ) + rewards[_account];
    }

    function getReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        console.log('User %o took reward %o', msg.sender, reward);
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.transfer(msg.sender, reward);
        }
    }

    function _min(uint x, uint y) private pure returns (uint) {
        return x <= y ? x : y;
    }
}
