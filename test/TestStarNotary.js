const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let tokenId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', tokenId, {from: user1});
    await instance.putStarUpForSale(tokenId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(tokenId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let tokenId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', tokenId, {from: user1});
    await instance.putStarUpForSale(tokenId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(tokenId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let tokenId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', tokenId, {from: user1});
    await instance.putStarUpForSale(tokenId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(tokenId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(tokenId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[0];
    let user2 = accounts[1];
    let tokenId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', tokenId, {from: user1});
    await instance.putStarUpForSale(tokenId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(tokenId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided;
    let tokenName = await instance.name.call();
    let tokenSymbol = await instance.symbol.call();
    assert.equal(tokenName, "My Star Token");
    assert.equal(tokenSymbol, "MST");
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let instance = await StarNotary.deployed();
    let person1 = accounts[0];
    let person2 = accounts[1];
    let tokenId1 = 6;
    let tokenId2 = 7;

    await instance.createStar('newawesomestar6', tokenId1, {from: person1 });
    await instance.createStar('newawesomestar7', tokenId2, {from: person2 });
    let theowner1Before = await instance.ownerOf(tokenId1);
    let theowner2Before = await instance.ownerOf(tokenId2);
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1, tokenId2);
    let theowner1After = await instance.ownerOf(tokenId1);
    let theowner2After = await instance.ownerOf(tokenId2);
    // 3. Verify that the owners changed
    assert.equal(theowner1After, theowner2Before);
    assert.equal(theowner2After, theowner1Before);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let person1 = accounts[0];
    let person2 = accounts[1];
    let tokenId = 8;

    await instance.createStar('newawesomestar8', tokenId, { from: person1 });
    let newowner1Before = await instance.ownerOf.call(tokenId);
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(person2, tokenId, { from: person1 });
    let newowner1After = await instance.ownerOf.call(tokenId);
    // 3. Verify the star owner changed.;
    assert.equal(newowner1Before, person1);
    assert.equal(newowner1After, person2);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let person1 = accounts[0];
    let tokenId = 9;

    await instance.createStar('newawesomestar9', tokenId, { from: person1 });
    // 2. Call your method lookUptokenIdToStarInfo
    let starName = await instance.lookUptokenIdToStarInfo.call(tokenId);
    // 3. Verify if you Star name is the same
    assert.equal(starName, 'newawesomestar9');
});
