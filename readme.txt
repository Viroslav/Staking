в папке contracts лежат все нужные контранты: 
	ERC20, IERC20, IERC20Metadata - вспомогательные и взяты просто с гитхаба openzeppelin
	Staking - основной контракт со стэкингом, я постаралась добавить комментарии но не везде (подробнее можно смотреть на ютуб https://www.youtube.com/watch?v=OJ-IRzCYSXI)
	RewardToken, StakingToken - основной контракт принимает на вход при конструировании два адреса контрактов: монеты которую будем стейкать и в которой будет реворд, поэтому я создала два этих контракта, они супер простые как из домашки
для компиляции команда: npx hardhat compile

в папке test должны быть тесты, сейчас там пустой файл
для запуска тестов команда: npx hardhat test (насколько я помню, сама не проверяла, тк тестов нет)

в папке scripts лежит тестовый скрипт (тоже на java script как и тесты) с помощью него я просто проверяла что все работает
чтобы запустить скрипт команда: npx hardhat run scripts/deploy.js

Необходимо для запуска: установить hardhat
Совет: пройтись по туториалу с их сайта https://hardhat.org/hardhat-runner/docs/getting-started