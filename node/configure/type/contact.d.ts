/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type NoName2 = string;
export type NoName4 = string;
export type NoName6 = string;
export type NoName7 = string;
export type HTML = string;

export interface NoName {
  reply: Value;
  mail: NoName1;
  url: URL;
  view: View;
  validator: NoName8;
}
export interface Value {
  [k: string]: unknown;
}
export interface NoName1 {
  subject: NoName2;
}
export interface URL {
  completed: NoName3;
}
export interface NoName3 {
  pathname: NoName4;
  search: NoName5;
}
export interface NoName5 {
  [k: string]: unknown;
}
export interface View {
  input: NoName6;
  completed: NoName7;
  mail: HTML;
}
export interface NoName8 {
  email: E;
  reply: NoName10;
  body: NoName12;
}
export interface E {
  message: NoName9;
}
export interface NoName9 {
  [k: string]: unknown;
}
export interface NoName10 {
  message: NoName11;
}
export interface NoName11 {
  [k: string]: unknown;
}
export interface NoName12 {
  message: NoName13;
}
export interface NoName13 {
  [k: string]: unknown;
}
