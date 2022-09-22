/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type MIME = string;
export type NoName8 = string;
export type NoName9 = string;
export type NoName7 = {
  type: MIME;
  name: NoName8;
  src: NoName9;
}[];
export type NoName12 = string;
export type NoName13 = string;
export type NoName14 = string;
export type NoName11 = {
  host: NoName12;
  name: NoName13;
  src: NoName14;
}[];
export type HTML = string;
export type NoName19 = string;
export type NoName20 = string;
export type NoName21 = string;
export type Feed = string;
export type Feed1 = string;
export type NoName18 = {
  html_path: HTML;
  xpath: XPath;
  feed_template: Feed;
  feed_path: Feed1;
}[];

export interface NoName {
  html: {
    book: NoName1;
    newspaper: NoName2;
    section_id: ID;
    toc: NoName3;
    localnav: NoName4;
    footnote: NoName5;
    anchor_type: NoName6;
    anchor_host: NoName10;
    anchor_amazon_associate: Amazon;
    heading_self_link: NoName15;
    time: Time;
    image: NoName16;
    image_amazon: Amazon1;
    highlight: NoName17;
  };
  feed: {
    info: NoName18;
  };
}
export interface NoName1 {
  target_element: string;
}
export interface NoName2 {
  target_element: string;
}
export interface ID {
  heading_levels: number[];
}
export interface NoName3 {
  target_element: string;
  class?: string;
  label?: string;
}
export interface NoName4 {
  target_class: string;
}
export interface NoName5 {
  trigger: {
    element: string;
    class: string;
    id_prefix: string;
    attributes: {
      /**
       * This interface was referenced by `undefined`'s JSON-Schema definition
       * via the `patternProperty` ".".
       */
      [k: string]: string;
    };
    parentheses_open?: string;
    parentheses_close?: string;
  };
  footnotes: {
    element: string;
    class: string;
    no_class: string;
    text_class: string;
    id_prefix: string;
  };
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
export interface NoName10 {
  target_class: string;
  insert_position: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
  parentheses: {
    before: string;
    after: string;
  };
  element: string;
  class: string;
  icon: NoName11;
  icon_size: number;
  icon_class: string;
}
export interface Amazon {
  target_class: string;
}
export interface NoName15 {
  target_class: string;
  insert_position: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
  anchor_wrap_class?: string;
  anchor_class?: string;
}
export interface Time {
  target_class: string;
}
export interface NoName16 {
  target_class: string;
}
export interface Amazon1 {
  target_class: string;
}
export interface NoName17 {
  target_class: string;
  class_prefix: string;
}
export interface XPath {
  wrap: NoName19;
  date: NoName20;
  content: NoName21;
}
