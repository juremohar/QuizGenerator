import m from 'mithril';

import { PionirjiView } from './views/Pionirji';
import { MladinciView } from './views/Mladinci';
import { PripravnikiView } from './views/Pripravniki';
import { MainLayout } from './layouts/MainLayout';
import { HomeView } from './views/Home';
import { LiteratureView } from './views/Literature';
import Constants from './constants';

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
        '/pionirji/literatura': {
            render: function() {
                return <MainLayout>
                    <LiteratureView category={Constants.Pionir} />
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
        '/mladinci/literatura': {
            render: function() {
                return <MainLayout>
                    <LiteratureView category={Constants.Mladinec} />
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
        '/pripravniki/literatura': {
            render: function() {
                return <MainLayout>
                    <LiteratureView category={Constants.Pripravnik} />
                </MainLayout>
            }
        }
    })
}

export { initRouter }