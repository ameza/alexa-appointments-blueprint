import { expect } from "chai";

import WorldlyHello from "../WorldlyHello";

describe("WorldlyHello", function() {
    describe("getHello", function() {
        it("returns the correct response for a known language (english)", function() {
            return WorldlyHello.getHello({language: "english"}).then((response) => {
                expect(response.text).to.equal("Hello");
                expect(response.ssml).to.equal("<speak>Hello</speak>");
            });
        });
        it("returns the correct response for a known language (welsh)", function() {
            return WorldlyHello.getHello({language: "welsh"}).then((response) => {
                expect(response.text).to.equal("Helo");
                expect(response.ssml).to.equal("<speak>Helo</speak>");
            });
        });
        it("returns the correct response for a known language (latin)", function() {
            return WorldlyHello.getHello({language: "latin"}).then((response) => {
                expect(response.text).to.equal("Salve");
                expect(response.ssml).to.equal("<speak>Salve</speak>");
            });
        });
        it("returns the correct response for a known language (esperanto)", function() {
            return WorldlyHello.getHello({language: "esperanto"}).then((response) => {
                expect(response.text).to.equal("Saluton");
                expect(response.ssml).to.equal("<speak>Saluton</speak>");
            });
        });
        it("rejects for an unknown language", function() {
            return WorldlyHello.getHello({language: "german"}).catch((error) => {
                expect(error).to.exist;
            });
        });
    });
});