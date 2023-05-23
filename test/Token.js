const { ethers } = require('hardhat')
const { expect } = require('chai')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Token", () => {
    let token
    beforeEach(async () => {
        // code that gets executed before each one of these tests

        // fetch token from the blockchain
        const Token = await ethers.getContractFactory("Token")
        token = await Token.deploy()
    })

    it("has the correct name", async () => {
        expect(await token.name()).to.equal('Vince Coin')
    })
    it("has the correct symbol", async () => {
        expect(await token.symbol()).to.equal('VIN')
    })
    it("has the correct number for decimals", async () => {
        expect(await token.decimals()).to.equal('18')
    })
    it("has the correct total supply", async () => {
        const value = tokens('1000000')
        expect(await token.totalSupply()).to.equal(value)
    })
})
