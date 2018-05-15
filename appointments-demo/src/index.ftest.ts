import * as bst from "bespoken-tools";
import { expect } from "chai";

describe("HelloWorld", function () {
    let server: bst.LambdaServer;
    let alexa: bst.BSTAlexa;

    beforeEach(function (done) {
        server = new bst.LambdaServer("./index.js", 10000, true);
        alexa = new bst.BSTAlexa("http://localhost:10000?disableSignatureCheck=true",
            "./speechAssets/IntentSchema.json",
            "./speechAssets/SampleUtterances.txt",
            "HelloWorld");
        server.start(function () {
            alexa.start(function (error) {
                if (error !== undefined) {
                    console.error("Error: " + error);
                    done();
                } else {
                    done();
                }
            });
        });
    });

    afterEach(function (done) {
        alexa.stop(function () {
            server.stop(function () {
                done();
            });
        });
    });
    describe("LaunchIntent", function () {
        it("launches", function () {
            this.timeout(5000);
            alexa.launched(function (error, payload) {
                expect(payload.response.outputSpeech.ssml).to.exist;
                expect(payload.response.outputSpeech.ssml).to.contain("Hello World");
            });
        });
    });
    describe("HelloWorldIntent", function() {
        it("returns a response", function() {
            this.timeout(5000);
            alexa.spoken("hello", function (error, payload) {
                expect(payload.response.outputSpeech.ssml).to.exist;
                expect(payload.response.outputSpeech.ssml).to.contain("Hello World");
            });
            alexa.spoken("say hello", function (error, payload) {
                expect(payload.response.outputSpeech.ssml).to.exist;
                expect(payload.response.outputSpeech.ssml).to.contain("Hello World");
            });
            alexa.spoken("say hello world", function (error, payload) {
                expect(payload.response.outputSpeech.ssml).to.exist;
                expect(payload.response.outputSpeech.ssml).to.contain("Hello World");
            });
        });
    });
    describe("WorldlyHelloIntent", function () {
        it("returns a response for a known language", function () {
            this.timeout(5000);
            alexa.spoken("say hello in {welsh}", function (error, payload) {
                expect(payload.response.outputSpeech.ssml).to.exist;
                expect(payload.response.outputSpeech.ssml).to.contain("Helo");
            });
            alexa.spoken("say hello in {english}", function (error, payload) {
                expect(payload.response.outputSpeech.ssml).to.exist;
                expect(payload.response.outputSpeech.ssml).to.contain("Hello");
            });
            alexa.spoken("say hello in {latin}", function (error, payload) {
                expect(payload.response.outputSpeech.ssml).to.exist;
                expect(payload.response.outputSpeech.ssml).to.contain("Salve");
            });
            alexa.spoken("say hello in {esperanto}", function (error, payload) {
                expect(payload.response.outputSpeech.ssml).to.exist;
                expect(payload.response.outputSpeech.ssml).to.contain("Saluton");
            });
        });
    });
});