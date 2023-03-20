/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type HTML = string;
export type NoName1 = string;
export type MIME = string;
export type NoName9 = string;
export type NoName10 = string;
export type NoName8 = {
  type: MIME;
  name: NoName9;
  src: NoName10;
}[];
export type NoName13 = string;
export type NoName14 = string;
export type NoName15 = string;
export type NoName12 = {
  host: NoName13;
  name: NoName14;
  src: NoName15;
}[];
export type HTML1 = string;
export type NoName21 = string;
export type NoName22 = string;
export type NoName23 = string;
export type Feed = string;
export type Feed1 = string;
export type NoName19 = {
  html_path: HTML1;
  selector: NoName20;
  feed_template: Feed;
  feed_path: Feed1;
}[];
export type Glob = string[];
export type NoName25 = string;
export type NoName26 = string;

export interface NoName {
  html: {
    directory: HTML;
    views: NoName1;
    book: NoName2;
    newspaper: NoName3;
    section_id: ID;
    toc: NoName4;
    localnav: NoName5;
    footnote: NoName6;
    anchor_type: NoName7;
    anchor_host: NoName11;
    anchor_amazon_associate: Amazon;
    heading_self_link: NoName16;
    time: Time;
    image: NoName17;
    image_amazon: Amazon1;
    highlight: NoName18;
  };
  feed: {
    info: NoName19;
  };
  sitemap: NoName24;
}
export interface NoName2 {
  target_element: string;
}
export interface NoName3 {
  target_element: string;
}
export interface ID {
  heading_levels: number[];
}
export interface NoName4 {
  target_element: string;
  class?: string;
  label?: string;
}
export interface NoName5 {
  target_class: string;
}
export interface NoName6 {
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
export interface NoName7 {
  target_class: string;
  insert_position: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
  parentheses: {
    before: string;
    after: string;
  };
  icon: NoName8;
  icon_size: number;
  icon_class: string;
}
export interface NoName11 {
  target_class: string;
  insert_position: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
  parentheses: {
    before: string;
    after: string;
  };
  element: string;
  class: string;
  icon: NoName12;
  icon_size: number;
  icon_class: string;
}
export interface Amazon {
  target_class: string;
}
export interface NoName16 {
  target_class: string;
  insert_position: "beforebegin" | "afterbegin" | "beforeend" | "afterend";
  anchor_wrap_class?: string;
  anchor_class?: string;
}
export interface Time {
  target_class: string;
}
export interface NoName17 {
  target_class: string;
}
export interface Amazon1 {
  target_class: string;
}
export interface NoName18 {
  target_class: string;
  class_prefix: string;
}
export interface NoName20 {
  wrap: NoName21;
  date: NoName22;
  content: NoName23;
}
export interface NoName24 {
  ignore: Glob;
  template: NoName25;
  path: NoName26;
}
