/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type NoName3 = string;
export type NoName4 = string;
export type NoName5 = string;
export type NoName2 = {
  host: NoName3;
  name: NoName4;
  src: NoName5;
}[];
export type MIME = string;
export type NoName8 = string;
export type NoName9 = string;
export type NoName7 = {
  type: MIME;
  name: NoName8;
  src: NoName9;
}[];
export type HTML = string;
export type NoName15 = string;
export type NoName16 = string;
export type NoName17 = string;
export type Feed = string;
export type Feed1 = string;
export type NoName14 = {
  html_path: HTML;
  xpath: XPath;
  feed_template: Feed;
  feed_path: Feed1;
}[];

export interface NoName {
  html: {
    anchor_host: NoName1;
    anchor_type: NoName6;
    anchor_amazon_associate: Amazon;
    heading_anchor: NoName10;
    time: Time;
    image: Picture;
    highlight: NoName11;
    book: NoName12;
    newspaper: NoName13;
  };
  feed: {
    info: NoName14;
  };
}
export interface NoName1 {
  target_class: string;
  insert_position: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
  parentheses: {
    before: string;
    after: string;
  };
  element: string;
  class: string;
  icon: NoName2;
  icon_size: number;
  icon_class: string;
}
export interface NoName6 {
  target_class: string;
  insert_position: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
  parentheses: {
    before: string;
    after: string;
  };
  icon: NoName7;
  icon_size: number;
  icon_class: string;
}
export interface Amazon {
  target_class: string;
}
export interface NoName10 {
  target_class: string;
  insert_position: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
  anchor_class: string;
}
export interface Time {
  target_class: string;
}
export interface Picture {
  target_class: string;
}
export interface NoName11 {
  target_class: string;
  class_prefix: string;
}
export interface NoName12 {
  target_element: string;
}
export interface NoName13 {
  target_element: string;
}
export interface XPath {
  wrap: NoName15;
  date: NoName16;
  content: NoName17;
}
