"use client";

import "mathlive";
import { useState } from "react";
import type { MathfieldElement } from "mathlive";
import { Container } from "@mantine/core";


declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<MathfieldElement>,
        MathfieldElement
      > & {
        value?: string;
        onInput?: (event: React.FormEvent<MathfieldElement>) => void;
      };
    }
  }
}


interface EditorProps {
  value: string;
  setValue: (value: string) => void;
}

export default function Editor({ value, setValue }: EditorProps) {
  return (
    <Container p="16">
      <math-field
        onInput={(evt: React.FormEvent<MathfieldElement>) => {
          const el = evt.target as MathfieldElement;
          setValue(el.value);
        }}
        style={{
          fontSize: "1.5rem",
          width: "100%",
          background: "#1a1b1e",
          color: "white",
          borderRadius: 8,
          padding: "0.5rem",
        } as React.CSSProperties}
      >
        {value}
      </math-field>
    </Container>
  );
}
