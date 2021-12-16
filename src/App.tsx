import React from 'react';

import { AppShell, MantineTheme } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Header } from './components/shared/header';
import { PATHS } from './meta/paths';
import { IntegralsTab, FunctionRootsTab, InterpolationTab, CauchyProblemTab } from "./components/tabs";


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
                    <Route path={PATHS.INTERPOLATION} element={<InterpolationTab/>}/>
                    <Route path={PATHS.FUNCTION_ZEROES} element={<FunctionRootsTab/>}/>
                    <Route path={PATHS.INTEGRALS} element={<IntegralsTab/>}/>
                    <Route path={PATHS.CAUCHY_PROBLEM} element={<CauchyProblemTab/>}/>
                </Routes>
            </AppShell>
        </BrowserRouter>
    );

}

export default App;
