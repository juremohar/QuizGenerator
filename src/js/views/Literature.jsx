
import Constants from "../constants";

let state = {
    category: null,
    files: []
};


let PionirLiteratura = {
    oninit: function() {
        state.files = [
            {
                name: "Drži - ne drži",
                path: "pionirji/drzi-nedrzi.pdf"
            },
            {
                name: "Prva pomoč",
                path: "pionirji/prva-pomoc.pdf"
            },
            {
                name: "Zgodovina",
                path: "pionirji/zgodovina.pdf"
            },
            {
                name: "Oznake in veščine",
                path: "pionirji/oznake-vescine.pdf"
            }

        ];
    },
    view: function() {
        return <div className="my-4">
            <h2>Pionirji literatura</h2>
            <p>Spodaj boste našli vse PDF datoteke z vprašanji, ki jih potrebujete znati.</p>
            <ul>
                {
                    state.files.map(file => {
                        const pdf = require(`../../assets/literature/${file.path}`)
                        return <li>
                            <a href={pdf} target="_blank">{file.name}</a>
                        </li>
                    })
                }
            </ul>
        </div>
    }
}

let MladinciLiteratura = {
    oninit: function() {
        state.files = [
            {
                name: "Drži - ne drži",
                path: "mladinci/drzi-nedrzi.pdf"
            },
            {
                name: "Prva pomoč",
                path: "mladinci/prva-pomoc.pdf"
            },
            {
                name: "Zgodovina",
                path: "mladinci/zgodovina.pdf"
            },
            {
                name: "Oznake in veščine",
                path: "mladinci/oznake-vescine.pdf"
            },
            {
                name: "Čini",
                path: "mladinci/cini.pdf"
            }

        ];
    },
    view: function() {
        return <div className="my-4">
            <h2>Mladinci literatura</h2>
            <p>Spodaj boste našli vse PDF datoteke z vprašanji, ki jih potrebujete znati.</p>
            <ul>
                {
                    state.files.map(file => {
                        const pdf = require(`../../assets/literature/${file.path}`)
                        return <li>
                            <a href={pdf} target="_blank">{file.name}</a>
                        </li>
                    })
                }
            </ul>
        </div>
    }
}

let PripravnikiLiteratura = {
    oninit: function() {
        state.files = [
            {
                name: "Drži - ne drži",
                path: "pripravniki/drzi-nedrzi.pdf"
            },
            {
                name: "Prva pomoč",
                path: "pripravniki/prva-pomoc.pdf"
            },
            {
                name: "Zgodovina",
                path: "pripravniki/zgodovina.pdf"
            },
            {
                name: "Oznake in veščine",
                path: "pripravniki/oznake-vescine.pdf"
            },
            {
                name: "Čini",
                path: "pripravniki/cini.pdf"
            }

        ];
    },
    view: function() {
        return <div className="my-4">
            <h2>Pripravniki literatura</h2>
            <p>Spodaj boste našli vse PDF datoteke z vprašanji, ki jih potrebujete znati.</p>
            <ul>
                {
                    state.files.map(file => {
                        const pdf = require(`../../assets/literature/${file.path}`)
                        return <li>
                            <a href={pdf} target="_blank">{file.name}</a>
                        </li>
                    })
                }
            </ul>
        </div>
    }
}

var LiteratureView = {
    oninit: function(vnode) {
        state.category = vnode.attrs.category
    },
    view: function() {
        return <div>
            { state.category == Constants.Pionir && <PionirLiteratura /> }
            { state.category == Constants.Mladinec && <MladinciLiteratura /> }
            { state.category == Constants.Pripravnik && <PripravnikiLiteratura /> }
        </div>
    }
}

export { LiteratureView }
