import m from 'mithril';

import { PionirjiView } from './views/Pionirji';
import { MladinciView } from './views/Mladinci';
import { PripravnikiView } from './views/Pripravniki';
import { MainLayout } from './layouts/MainLayout';
import { HomeView } from './views/Home';
import { LiteratureView } from './views/Literature';

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
        '/pionirji/kviz': {
            render: function() {
                return <MainLayout>
                    <PionirjiView />
                </MainLayout>
            }
        },
        '/mladinci/kviz': {
            render: function() {
                return <MainLayout>
                    <MladinciView />
                </MainLayout>
            }
        },
        '/pripravniki/kviz': {
            render: function() {
                return <MainLayout>
                    <PripravnikiView />
                </MainLayout>
            }
        },
        '/literatura': {
            render: function() {
                return <MainLayout>
                    <LiteratureView />
                </MainLayout>
            }
        }
    })
}

export { initRouter }