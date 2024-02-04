var PionirCard = {
    oninit: function() {

    },
    view: function() {
        return <div className="card" style="width: 18rem; border: 0;">
            <img src="https://www.pgd-apace.si/wp-content/uploads/2017/10/pionir-280x300.jpg" className="card-img-top" alt="Pionir" />
            <div className="card-body border" style="flex: 0">
                <h5 className="card-title">Pionir</h5>
                <p>Kviz za pionirčke.</p>
                <a class="btn btn-primary" onclick={ () => { m.route.set("/pionirji/kviz") }}>Kviz</a>
                <a class="btn btn-secondary m-2" onclick={ () => { m.route.set("/pionirji/literatura") }}>Literatura</a>
            </div>
        </div>
    }
}

var MladinecCard = {
    oninit: function() {

    },
    view: function() {
        return <div className="card" style="width: 18rem; border: 0;">
            <img src="https://www.pgd-apace.si/wp-content/uploads/2017/10/mladinec-281x300.jpg" className="card-img-top" alt="Mladinci" />
            <div className="card-body border" style="flex: 0;">
                <h5 className="card-title">Mladinec</h5>
                <p>Kviz za mladince.</p>
                <a class="btn btn-primary" onclick={ () => { m.route.set("/mladinci/kviz") }}>Kviz</a>
                <a class="btn btn-secondary m-2" onclick={ () => { m.route.set("/mladinci/literatura") }}>Literatura</a>
            </div>
        </div>
    }
}

var PripravnikCard = {
    oninit: function() {

    },
    view: function() {
        return <div className="card" style="width: 18rem; border: 0;">
            <img src="https://www.pgd-apace.si/wp-content/uploads/2017/10/pripravnik-281x300.jpg" className="card-img-top" alt="Pripravniki" />
            <div className="card-body border" style="flex: 0;">
                <h5 className="card-title">Pripravnik</h5>
                <p>Kviz za pripravnike.</p>
                <a class="btn btn-primary" onclick={ () => { m.route.set("/pripravniki/kviz") }}>Kviz</a>
                <a class="btn btn-secondary m-2" onclick={ () => { m.route.set("/pripravniki/literatura") }}>Literatura</a>
            </div>
        </div>
    }
}


var HomeView = {
    oninit: function() {
    },
    view: function() {
        return <div className="d-flex justify-content-around align-items-center min-vh-100 home-layout">
            <PionirCard />
            <MladinecCard />
            <PripravnikCard />
        </div>
    }
}

export { HomeView }
