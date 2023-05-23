const { ethers } = require('hardhat')
const { expect } = require('chai')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Token", () => {
    let token
    let accounts
    let deployer
    let receiver
    beforeEach(async () => {
        // code that gets executed before each one of these tests

        // fetch token from the blockchain
        const Token = await ethers.getContractFactory("Token")
        token = await Token.deploy('Vince Coin', 'VIN', 1000000)
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
    })

    describe('Deployment', () => {
        const name = 'Vince Coin'
        const symbol = 'VIN'
        const decimals = '18'
        const totalSupply = tokens('1000000')

        it("has the correct name", async () => {
            expect(await token.name()).to.equal(name)
        })
        it("has the correct symbol", async () => {
            expect(await token.symbol()).to.equal(symbol)
        })
        it("has the correct number for decimals", async () => {
            expect(await token.decimals()).to.equal(decimals)
        })
        it("has the correct total supply", async () => {
            expect(await token.totalSupply()).to.equal(totalSupply)
        })
        it("assigns the total supply to the deployer", async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
        })
    })

    describe('Sending tokens', () => {
        let amount, transaction, result
        it('Transfers token balances', async () => {
            // transfer tokens
            amount = tokens(100)
            transaction = await token.connect(deployer).transfer(receiver.address, amount)
            result = await transaction.wait()

            // ensure that tokens were transferred, balances changed correctly
            expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
            expect(await token.balanceOf(receiver.address)).to.equal(amount)
        })
    })

})
