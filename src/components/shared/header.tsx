import React from 'react';

import { Link } from 'react-router-dom';
import { PATHS } from '../../paths';

import { Button, Group, Header as MantineHeader } from '@mantine/core';
import { FontFamilyIcon, FrameIcon, SlashIcon } from '@radix-ui/react-icons';


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
            </Group>
        </MantineHeader>
    );

}