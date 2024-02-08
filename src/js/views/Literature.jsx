
import Constants from "../constants";

let state = {
    category: null,
    files: [
        {
            name: "Drži - ne drži",
            path: "pionirji/drzi-nedrzi.pdf",
            category: Constants.Pionir
        },
        {
            name: "Prva pomoč",
            path: "pionirji/prva-pomoc.pdf",
            category: Constants.Pionir
        },
        {
            name: "Zgodovina",
            path: "pionirji/zgodovina.pdf",
            category: Constants.Pionir
        },
        {
            name: "Oznake in veščine",
            path: "pionirji/oznake-vescine.pdf",
            category: Constants.Pionir
        },
        {
            name: "Drži - ne drži",
            path: "mladinci/drzi-nedrzi.pdf",
            category: Constants.Mladinec
        },
        {
            name: "Prva pomoč",
            path: "mladinci/prva-pomoc.pdf",
            category: Constants.Mladinec
        },
        {
            name: "Zgodovina",
            path: "mladinci/zgodovina.pdf",
            category: Constants.Mladinec
        },
        {
            name: "Oznake in veščine",
            path: "mladinci/oznake-vescine.pdf",
            category: Constants.Mladinec
        },
        {
            name: "Čini",
            path: "mladinci/cini.pdf",
            category: Constants.Mladinec
        },
        {
            name: "Drži - ne drži",
            path: "pripravniki/drzi-nedrzi.pdf",
            category: Constants.Pripravnik
        },
        {
            name: "Prva pomoč",
            path: "pripravniki/prva-pomoc.pdf",
            category: Constants.Pripravnik
        },
        {
            name: "Zgodovina",
            path: "pripravniki/zgodovina.pdf",
            category: Constants.Pripravnik
        },
        {
            name: "Oznake in veščine",
            path: "pripravniki/oznake-vescine.pdf",
            category: Constants.Pripravnik
        },
        {
            name: "Čini",
            path: "pripravniki/cini.pdf",
            category: Constants.Pripravnik
        }
    ],
    currentTab: null
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

let Tabs = {
    oninit: function(vnode) {
        state.currentTab = null;
    },
    view: function() {
        return <ul class="nav nav-pills p-4">
            <li class="nav-item" onclick={() => {state.currentTab = null}}>
                <a class={state.currentTab == null ? "nav-link active" : "nav-link"}>Vse</a>
            </li>
            <li class="nav-item" onclick={() => {state.currentTab = Constants.Pionir}}>
                <a class={state.currentTab == Constants.Pionir ? "nav-link active" : "nav-link"}>Pionirji</a>
            </li>
            <li class="nav-item" onclick={() => {state.currentTab = Constants.Mladinec}}>
                <a class={state.currentTab == Constants.Mladinec ? "nav-link active" : "nav-link"}>Mladinci</a>
            </li>
            <li class="nav-item" onclick={() => {state.currentTab = Constants.Pripravnik}}>
                <a class={state.currentTab == Constants.Pripravnik ? "nav-link active" : "nav-link"}>Pripravniki</a>
            </li>
            <li class="nav-item" onclick={() => {state.currentTab = Constants.Pripravnik}}>
                <a className="nav-link" href="#">Domov</a>
            </li>
        </ul>
    }
}

let PionirFiles = {
    oninit: function(vnode) {
    },
    view: function() {
        return <div>
            <div className="row">
                <h6>Pionirji</h6>
                <div>Seznam literature za pionirje.</div>
                <ul>
                    { state
                        .files
                        .filter(file => file.category == Constants.Pionir)
                        .map((file) => {
                            const pdf = require(`../../assets/literature/${file.path}`)
                            return <li>
                                <a href={pdf} target="_blank"><i class="bi bi-file-earmark-pdf"></i> {file.name}</a>
                            </li>
                        })
                    }
                </ul>
            </div>
        </div>
    }
}

let MladinecFiles = {
    oninit: function(vnode) {
    },
    view: function() {
        return <div>
            <h6>Mladinci</h6>
            <div>Seznam literature za mladince. Mladinci potrebuje znati tudi celotno literaturo od pionirjev.</div>
            <div className="row">
                <ul>
                    { state
                        .files
                        .filter(file => file.category == Constants.Mladinec)
                        .map((file) => {
                            const pdf = require(`../../assets/literature/${file.path}`)
                            return <li>
                                <a href={pdf} target="_blank"><i class="bi bi-file-earmark-pdf"></i> {file.name}</a>
                            </li>
                        })
                    }
                </ul>
            </div>
        </div>
    }
}

let PripravnikFiles = {
    oninit: function(vnode) {
    },
    view: function() {
        return <div>
            <div className="row">
                <h6>Pripravniki</h6>
                <div>Seznam dodatne literature za pripravnike. Pripravniki potrebuje znati tudi celotno literaturo od pionirjev in mladincev.</div>
                <ul>
                    { state
                        .files
                        .filter(file => file.category == Constants.Pripravnik)
                        .map((file) => {
                            const pdf = require(`../../assets/literature/${file.path}`)
                            return <li>
                                <a href={pdf} target="_blank"> <i class="bi bi-file-earmark-pdf"></i> {file.name}</a>
                            </li>
                        })
                    }
                </ul>
            </div>
        </div>
    }
}


let AllFiles = {
    oninit: function(vnode) {
    },
    view: function() {
        return <div>
           <PionirFiles />
           <MladinecFiles />
           <PripravnikFiles />
        </div>
    }
}

var LiteratureView = {
    oninit: function(vnode) {
      
    },
    view: function() {
        return <div>
            <Tabs />
            { !state.currentTab && <AllFiles /> }
            { state.currentTab == Constants.Pionir && <PionirFiles /> }
            { state.currentTab == Constants.Mladinec && <MladinecFiles /> }
            { state.currentTab == Constants.Pripravnik && <PripravnikFiles /> }
        </div>
    }
}

export { LiteratureView }
