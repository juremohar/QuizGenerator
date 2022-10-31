import m from 'mithril';

import { PionirjiView } from './views/Pionirji';
import { MainLayout } from './layouts/MainLayout';

function initRouter(el) {
    m.route.prefix = '';

    m.route(el, '/', {
        '/': {
            render: function() {
                return <MainLayout>
                    <PionirjiView />
                </MainLayout>
            }
        },
        '/home': {
            render: function() {
                return <MainLayout>
                    <PionirjiView />
                </MainLayout>
            }
        }
    })
}

export { initRouter }