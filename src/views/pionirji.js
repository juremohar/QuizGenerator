
var m = require("mithril")
const trueFalseJson = require('../../data/ves_neves.json').filter(q => q.ages.includes("pioner"));
const firstAidJson = require('../../data/prva_pomoc.json').filter(q => q.ages.includes("pioner"));
const firePreventionJson = require('../../data/pozarna_preventiva.json').filter(q => q.ages.includes("pioner"));

function loadQuestions() {
    return {
        "trueFalse": getQuestions(trueFalseJson, 10),
        "firstAid": getQuestions(firstAidJson, 10),
        "firePrevention": getQuestions(firePreventionJson, 15)
    }
}

function getQuestions(list, numberOfQuestions) {
    return list.sort(() => 0.5 - Math.random()).slice(0, numberOfQuestions);
}

function generateTrueFalseQuestions(questions) {
    return questions.map(q => {
        let pickCorrect = Math.random() < 0.5;
        let answear = q.correctAnswear;
        if (!pickCorrect) {
            answear = q.wrongAnswears.sort(function() {return 0.5 - Math.random()})[0];
        }

        return {
            question: q.question,
            answear: answear
        }
    });
}

function generateFirstAidQuestions(questions) {
    return questions.map(q => {
        let answears = q.wrongAnswears.sort(function() {return 0.5 - Math.random()}).slice(0, 2);
        answears.push(q.correctAnswear)

        return {
            question: q.question,
            answears: answears.sort(function() {return 0.5 - Math.random()})
        };
    });
}

function generateFirePreventiondQuestions(questions) {
    return questions.map(q => {
        let answears = q.wrongAnswears.sort(function() {return 0.5 - Math.random()}).slice(0, 2);
        answears.push(q.correctAnswear)

        return {
            question: q.question,
            answears: answears.sort(function() {return 0.5 - Math.random()})
        };
    });
}

let trueFalseQuestions = {
    questions: null,
    oninit: function(vnode) {
        this.questions = generateTrueFalseQuestions(vnode.attrs.questions)
    },
    view: function() {
        if (!this.questions) {
            return m("div", "Generiram vprašanja ...")
        }

        return m("div.my-4", [
            m("div.fs-4.fw-bold", "Drži/ne drži"),
            m("div.mb-2.fs-7.fw-light", "Spodaj je 10 vprašanj. Ugotovite ali je odgovor na vprašanje pravilen."),
            [
                this.questions.map((q, index) => {
                    return m("div.mb-4", [
                        m("div", [
                            m("span.fw-bold", `Vprašanje ${index + 1}: `),
                            q.question
                        ]),
                        m("div", q.answear)
                    ])
                })
            ]
        ])
    }
}

let firstAidQuestions = {
    questions: null,
    oninit: function(vnode) {
        this.questions = generateFirstAidQuestions(vnode.attrs.questions)
    },
    view: function() {
        if (!this.questions) {
            return m("div", "Generiram vprašanja ...")
        }

        return m("div", [
            m("div.fs-4.fw-bold", "Prva pomoč"),
            m("div.mb-2.fs-7.fw-light", "Spodaj je 10 vprašanj. Izberite kateri odgovor je pravilen."),
            [
                this.questions.map((q, index) => {
                    return m("div.mb-4", [
                        m("div", [
                            m("span.fw-bold", `Vprašanje ${index + 1}: `),
                            q.question
                        ]),
                        m("ol.ps-4", { type: "a" } ,q.answears.map(answear => {
                            return m("li.ps-2", answear)
                        }))
                    ])
                })
            ]
        ])
    }
}

let firePreventionQuestions = {
    questions: null,
    oninit: function(vnode) {
        this.questions = generateFirePreventiondQuestions(vnode.attrs.questions)
    },
    view: function() {
        if (!this.questions) {
            return m("div", "Generiram vprašanja ...")
        }

        return m("div", [
            m("div.fs-4.fw-bold", "Požarna preventiva"),
            m("div.mb-2.fs-7.fw-light", "Spodaj je 10 vprašanj. Izberite kateri odgovor je pravilen."),
            [
                this.questions.map((q, index) => {
                    return m("div.mb-4", [
                        m("div", [
                            m("span.fw-bold", `Vprašanje ${index + 1}: `),
                            q.question
                        ]),
                        m("ol.ps-4", { type: "a" } ,q.answears.map(answear => {
                            return m("li.ps-2", answear)
                        }))
                    ])
                })
            ]
        ])
    }
}



module.exports = {
    questions: null,
    oninit: function() {
        this.questions = loadQuestions()
    },
    view: function() {
        if (this.questions == null) {
            return m("div", "Generiram vprašanja ...")
        }

        return m("div.container", [
            m(trueFalseQuestions, {questions: this.questions.trueFalse}),
            m(firstAidQuestions, {questions: this.questions.firstAid}),
            m(firePreventionQuestions, {questions: this.questions.firePrevention})
        ])
    }
}