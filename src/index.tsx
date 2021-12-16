import React from 'react';
import ReactDOM from 'react-dom';

import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import App from './App';

import './index.css';


ReactDOM.render(
    <React.StrictMode>
        <MantineProvider theme={{
            fontFamily: 'Montserrat, sans serif',
            spacing: {
                xs: 15,
                sm: 20,
                md: 25,
                lg: 30,
                xl: 40
            },
            colorScheme: 'dark',
        }}>
            <NotificationsProvider>
                <App/>
            </NotificationsProvider>
        </MantineProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
