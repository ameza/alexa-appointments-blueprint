import * as chai from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import MockHandler from "../../assets/MockHandler";
import BuiltInController from "../BuiltInController";

chai.use(sinonChai);
let expect = chai.expect;

describe("WorldlyHelloController", function () {
    describe("sayHello", function () {
        describe("with a known language", function () {
            let mockHandler = new MockHandler();
            mockHandler.event = { request: { intent: { slots: { Language: { value: "welsh" } } } } };
            let emitStub = sinon.stub(mockHandler, "emit");
            let worldlyHelloController = new BuiltInController(mockHandler);
            worldlyHelloController.stop();
            it("returns hello world", function () {
                expect(emitStub).to.have.been.calledOnce;
                expect(emitStub).to.have.been.calledWith(":tell", "Helo");
            });
        });
        describe("with an unknown language", function () {
            let mockHandler = new MockHandler();
            mockHandler.event = { request: { intent: { slots: { Language: { value: "german" } } } } };
            let emitStub = sinon.stub(mockHandler, "emit");
            let worldlyHelloController = new BuiltInController(mockHandler);
            worldlyHelloController.stop();
            it("returns hello world", function () {
                expect(emitStub).to.have.been.calledOnce;
                expect(emitStub).to.have.been.calledWith(":tell", "I could not find hello in that language");
            });
        });
    });
});