"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import * as React from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object(
  Array.from({ length: 10 }, (_, i) => `V${i + 1}`).reduce((acc, key) => {
    acc[key] = z.coerce.number().min(-100, "Must be >= -100").max(100, "Must be <= 100");
    return acc;
  }, {} as Record<string, z.ZodNumber>)
);

type ManualInputFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
};

export function ManualInputForm({ onSubmit, isLoading }: ManualInputFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: Array.from({ length: 10 }, (_, i) => `V${i + 1}`).reduce((acc, key) => {
      acc[key] = parseFloat((Math.random() * 20 - 10).toFixed(2));
      return acc;
    }, {} as Record<string, number>),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-x-2 gap-y-3">
          {Object.keys(form.getValues()).map((key) => (
            <FormField
              key={key}
              control={form.control}
              name={key as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal">{key}</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} className="h-8"/>
                  </FormControl>
                  <FormMessage className="text-xs"/>
                </FormItem>
              )}
            />
          ))}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Run Prediction
        </Button>
      </form>
    </Form>
  );
}
