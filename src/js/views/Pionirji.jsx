import { TrueFalseComponent } from '../components/TrueFalseComponent';
import Constants from '../constants';
import { appState } from '../appstate'; 

const trueFalseJson = require('../../../data/ves_neves.json').filter(q => q.ages.includes(Constants.Pioner));

let state = {
    trueFalseQuestions: [],
    showTrueFalseQuestionsResult: false
};

function getQuestions(questions, numberOfQuestions) {
    let list = questions.sort(() => 0.5 - Math.random()).slice(0, numberOfQuestions);
    return generateTrueFalseQuestions(list);
}

function generateTrueFalseQuestions(questions) {
    return questions.map(q => {
        let pickCorrect = Math.random() < 0.5;
        let randomAnswear = q.correctAnswear;
        if (!pickCorrect) {
            randomAnswear = q.wrongAnswears.sort(function() {return 0.5 - Math.random()})[0];
        }

        return {
            question: q.question,
            correctAnswear: q.correctAnswear,
            randomAnswear: randomAnswear,
            userAnswear: null
        }
    });
}

function handleUserAnswearSelection(question, trueFalse) {
    let questionsRecord = state.trueFalseQuestions.find(q => {
        return q.question == question;
    });

    questionsRecord.userAnswear = trueFalse;
}

var PionirjiView = {
    oninit: function() {
        state.trueFalseQuestions = getQuestions(trueFalseJson, 10);
    },
    view: function() {
        return <div className="my-4">
            <div className='fs-4 fw-bold'>
                Drži/ne drži
            </div>

            <div className='mb-2 fw-light'>
                Spodaj je 10 vprašanj. Ugotovite ali je odgovor na vprašanje pravilen.
            </div>

            <div className='mb-2'>
                {
                    state.trueFalseQuestions.map((q, index) => {
                        return <TrueFalseComponent 
                            question={q.question} 
                            correctAnswear={q.correctAnswear}
                            randomAnswear={q.randomAnswear} 
                            userAnswear={q.userAnswear}
                            questionNumber={index}
                            showTrueFalseQuestionsResult={state.showTrueFalseQuestionsResult} 
                            onAnswearSelection={handleUserAnswearSelection} 
                        />
                    })
                }
            </div>

            <button 
                type="button" 
                class="btn btn-primary checkResultButton"
                onclick={() => { state.showTrueFalseQuestionsResult = true }}
            >Preveri</button>
        </div>
    },
    onremove: function() {
        appState.questions = [];
    }
}

export { PionirjiView }
