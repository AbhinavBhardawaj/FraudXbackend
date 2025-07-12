
"use client";

import * as React from 'react';
import { SendHorizonal, Bot, User, Loader2 } from 'lucide-react';
import Textarea from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


type AskAiProps = {
    messages: Message[];
    onSubmit: (question: string) => void;
    isReplying: boolean;
    isDataAvailable: boolean;
};

export function AskAi({ messages, onSubmit, isReplying, isDataAvailable }: AskAiProps) {
    const [input, setInput] = React.useState('');
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isReplying) return;
        onSubmit(input);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const getInitialMessage = () => {
        if (!isDataAvailable) {
            return "Hello! I can answer questions about your transaction data. Please run a prediction first to get started.";
        }
        return "I'm ready to answer questions about the current transaction results. What would you like to know?";
    }

    return (
        <div className="flex flex-col h-full max-h-[400px]">
            <ScrollArea className="flex-1 p-2" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.length === 0 ? (
                         <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 border">
                                <AvatarFallback><Bot /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1 rounded-lg bg-muted p-3 text-sm">
                                <p>{getInitialMessage()}</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex items-start gap-3',
                                    message.role === 'user' ? 'justify-end' : ''
                                )}
                            >
                                {message.role === 'assistant' && (
                                     <Avatar className="h-8 w-8 border">
                                        <AvatarFallback><Bot /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={cn(
                                        'max-w-[80%] rounded-lg p-3 text-sm',
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    )}
                                >
                                    <p>{message.content}</p>
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))
                    )}
                     {isReplying && (
                        <div className="flex items-start gap-3">
                             <Avatar className="h-8 w-8 border">
                                <AvatarFallback><Bot /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1 rounded-lg bg-muted p-3 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <form onSubmit={handleSubmit} className="relative mt-2">
                <Textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    minRows={1}
                    maxRows={5}
                    placeholder="Ask a question..."
                    className="w-full resize-none rounded-md border border-input bg-background p-2 pr-10 text-sm shadow-sm"
                    disabled={isReplying || !isDataAvailable}
                />
                <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute bottom-1 right-1 h-8 w-8"
                    disabled={isReplying || !input.trim()}
                >
                    <SendHorizonal className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                </Button>
            </form>
        </div>
    );
}
