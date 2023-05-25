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
    let exchange
    beforeEach(async () => {
        // code that gets executed before each one of these tests

        // fetch token from the blockchain
        const Token = await ethers.getContractFactory("Token")
        token = await Token.deploy('Vince Coin', 'VIN', 1000000)
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        receiver = accounts[1]
        exchange = accounts[2]
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

        describe("Success", () => {
            beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).transfer(receiver.address, amount)
                result = await transaction.wait()
            })
            it('Transfers token balances', async () => {
                // ensure that tokens were transferred, balances changed correctly
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
            })
            it("Emits a transfer event", async () => {
                const event = result.events[0]
                expect(event.event).to.equal('Transfer')
    
                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
            })
        })

        describe("Failure", () => {
            it("Rejects insufficient balances", async () => {
                // transfer more tokens than the deployer has
                const invalidAmount = tokens(2000000)
                await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
            })
            it("Rejects an invalid recipient", async () => {
                const amount = tokens(100)
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })

        describe("Approving Tokens", () => {
            let amount, transaction, result
            beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).approve(exchange.address, amount)
                result = await transaction.wait()
            })

            describe("Success", () => {
                it("allocates an allowance for delegated token spending", async () => {
                    expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
                })

                it("Emits an approval event", async () => {
                    const event = result.events[0]
                    expect(event.event).to.equal('Approval')
        
                    const args = event.args
                    expect(args.owner).to.equal(deployer.address)
                    expect(args.spender).to.equal(exchange.address)
                    expect(args.value).to.equal(amount)
                })
            })

            describe("Failure", () => {
                it("rejects invalid spenders", async () => {
                    await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
                })
            })
            
        })

        describe("Delegated token transfers", () => {
            let amount, transaction, result

            beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).approve(exchange.address, amount)
                result = await transaction.wait()
            })

            describe("Success", () => {
                beforeEach(async () => {
                    transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)
                    result = await transaction.wait()
                })

                it("transfers token balances", async () => {
                    expect(await token.balanceOf(deployer.address)).to.equal(tokens('999900'))
                    expect(await token.balanceOf(receiver.address)).to.equal(amount)
                })

                it("resets the allowance", async () => {
                    expect(await token.allowance(deployer.address, exchange.address)).to.equal('0')
                })

                it("emits a transfer event", async () => {
                    const event = result.events[0]
                    expect(event.event).to.equal('Transfer')

                    const args = event.args
                    expect(args.from).to.equal(deployer.address)
                    expect(args.to).to.equal(receiver.address)
                    expect(args.value).to.equal(amount)
                })
            })

            describe("Failure", async () => {
                // Attempt to transfer too many tokens
                it("rejects attempts to transfer an amount greater than allowance", async () => {
                    const invalidAmount = tokens(2000000)
                    await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
                })
            })
        })
        
    })

})
