import m from 'mithril';

import { PionirjiView } from './views/Pionirji';
import { MainLayout } from './layouts/MainLayout';
import { HomeView } from './views/Home';

function initRouter(el) {
    // m.route.prefix = '';

    m.route(el, '/', {
        '/': {
            render: function() {
                return <MainLayout>
                    <HomeView />
                </MainLayout>
            }
        },
        '/pionirji': {
            render: function() {
                return <MainLayout>
                    <PionirjiView />
                </MainLayout>
            }
        },
        '/mladinci': {
            render: function() {
                return <MainLayout>
                    <PionirjiView />
                </MainLayout>
            }
        }
    })
}

export { initRouter }