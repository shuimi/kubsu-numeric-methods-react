import React from 'react';

import { Link } from 'react-router-dom';
import { PATHS } from '../../meta/paths';

import { Button, Group, Header as MantineHeader } from '@mantine/core';
import { FontFamilyIcon, FrameIcon, SlashIcon, GridIcon } from '@radix-ui/react-icons';


export const Header = () => {

    return (
        <MantineHeader height={60} padding='xs'>
            <Group>
                <Link to={PATHS.INTERPOLATION}>
                    <Button leftIcon={<FrameIcon/>} variant='outline' color='gray'>
                        Interpolation
                    </Button>
                </Link>
                <Link to={PATHS.FUNCTION_ZEROES}>
                    <Button leftIcon={<FontFamilyIcon/>} variant='outline' color='gray'>
                        Equation roots
                    </Button>
                </Link>
                <Link to={PATHS.INTEGRALS}>
                    <Button leftIcon={<SlashIcon/>} variant='outline' color='gray'>
                        Integrals
                    </Button>
                </Link>
                <Link to={PATHS.CAUCHY_PROBLEM}>
                    <Button leftIcon={<GridIcon/>} variant='outline' color='gray'>
                        Cauchy problem
                    </Button>
                </Link>
            </Group>
        </MantineHeader>
    );

}