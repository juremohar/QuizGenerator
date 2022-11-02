
let MainLayout = {
    view: function(vnode) {
        return <div className="container">{ vnode.children }</div>
    }
}

export { MainLayout }