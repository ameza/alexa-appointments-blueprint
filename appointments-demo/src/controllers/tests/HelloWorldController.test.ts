import * as chai from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import MockHandler from "../../assets/MockHandler";
import HelloWorldController from "../HelloWorldController";

chai.use(sinonChai);
let expect = chai.expect;

describe("HelloWorldController", function() {
    describe("sayHello", function() {
        const mockHandler = new MockHandler();
        const emitStub = sinon.stub(mockHandler, "emit");
        const helloWorldController = new HelloWorldController(mockHandler);
        helloWorldController.sayHello();
        it("returns hello world", function() {
            expect(emitStub).to.have.been.calledOnce;
            expect(emitStub).to.have.been.calledWith(":tell", "Hello World");
        });
    });
});