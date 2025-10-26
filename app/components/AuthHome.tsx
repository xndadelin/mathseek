'use client';

import 'mathlive';
import { useState } from 'react';
import Editor from './Editor';


export default function AuthHome() {
    const [value, setValue] = useState('');
    return (
        <Editor value={value} setValue={setValue} />
    )
}