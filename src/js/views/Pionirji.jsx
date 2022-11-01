import { TrueFalseComponent } from '../components/TrueFalseComponent';
import { MultipleChoiceComponent } from '../components/MultipleChoiceComponent';
import Constants from '../constants';
import { generateTrueFalseQuestions, generateMultipleChoiceQuestions  } from '../../helpers/questions';


let state = {
    trueFalseQuestions: [],
    showTrueFalseQuestionsResult: false,
    firstAidQuestions: [],
    showFirstAidQuestionsResult: false
};

function handleUserTrueFalseSelection(question, trueFalse) {
    if (state.showTrueFalseQuestionsResult) return;

    let questionsRecord = state.trueFalseQuestions.find(q => {
        return q.question == question;
    });

    questionsRecord.userAnswer = trueFalse;
}

function handleFirstAidSelection(question, userAnswer) {
    if (state.showFirstAidQuestionsResult) return;

    let questionsRecord = state.firstAidQuestions.find(q => {
        return q.question == question;
    });

    questionsRecord.userAnswer = userAnswer;
}

let TrueFalse = {
    oninit: function() {
        state.trueFalseQuestions = generateTrueFalseQuestions(Constants.Pionir, 10);
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
                            correctAnswer={q.correctAnswer}
                            randomAnswer={q.randomAnswer} 
                            userAnswer={q.userAnswer}
                            questionNumber={index}
                            showResults={state.showTrueFalseQuestionsResult} 
                            onAnswerSelection={handleUserTrueFalseSelection} 
                        />
                    })
                }
            </div>

            <button 
                type="button" 
                class="btn btn-primary check-result-button"
                onclick={() => { state.showTrueFalseQuestionsResult = true }}
            >Preveri</button>
        </div>
    }
}

let FirstAid = {
    oninit: function() {
        state.firstAidQuestions = generateMultipleChoiceQuestions(Constants.Pionir, "prva_pomoc", 10);
        console.log(state)
    },
    view: function() {
        return <div className="my-4">
            <div className='fs-4 fw-bold'>
                Prva pomoč
            </div>

            <div className='mb-2 fw-light'>
                Spodaj je 10 vprašanj. Izberite kateri odgovor je pravilen.
            </div>

            <div className='mb-2'>
                {
                    state.firstAidQuestions.map((q, index) => {
                        return <MultipleChoiceComponent 
                            question={q.question} 
                            correctAnswer={q.correctAnswer}
                            answers={q.answers} 
                            userAnswer={q.userAnswer}
                            questionNumber={index}
                            showResults={state.showFirstAidQuestionsResult} 
                            onAnswerSelection={handleFirstAidSelection} 
                        />
                    })
                }
            </div>

            <button 
                type="button" 
                class="btn btn-primary check-result-button"
                onclick={() => { state.showFirstAidQuestionsResult = true }}
            >Preveri</button>
        </div>
    }
}

var PionirjiView = {
    oninit: function() {
    },
    view: function() {
        return <div>
           <TrueFalse />
           <FirstAid />
        </div>
    }
}

export { PionirjiView }
