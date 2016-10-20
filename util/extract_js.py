#!/usr/bin/env python
from urllib2 import urlopen
from lxml import html
page = urlopen('http://localhost:8080/')
page_source = html.parse(page)
from pprint import pprint
pprint(page_source.xpath('//script/@src'))