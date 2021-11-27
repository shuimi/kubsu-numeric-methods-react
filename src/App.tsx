import React from 'react';

import { AppShell, MantineTheme } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Header } from './components/shared/header';
import { PATHS } from './paths';
import { IntegralsTab } from "./components/tabs";
import ChartTab from "./components/tabs/chart-tab";
import { FunctionRootsTab } from "./components/tabs";


const shellStyle = (theme: MantineTheme) => ({
    main: {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]
    },
});

const App = () => {

    return (
        <BrowserRouter>
            <AppShell header={<Header/>} styles={shellStyle}>
                <Routes>
                    <Route path={PATHS.INTERPOLATION} element={<ChartTab/>}/>
                    <Route path={PATHS.FUNCTION_ZEROES} element={<FunctionRootsTab/>}/>
                    <Route path={PATHS.INTEGRALS} element={<IntegralsTab/>}/>
                </Routes>
            </AppShell>
        </BrowserRouter>
    );

}

export default App;
