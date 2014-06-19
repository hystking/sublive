# -*- coding: utf-8 -*-
from sublime import *
from sublime_plugin import *

import sys
import os
import threading
import platform
import json
import sched
import time

# request-dists is the folder in our plugin
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "lib"))

from tornado.web import *
import tornado.ioloop
import tornado.websocket
import tornado.httpserver

class SocketHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		global cone
		if self not in cone:
			cone.append(self)
		print "-------------------"
		print "connected"
		print cone
		print "--------------------"
	def on_close(self):
		global cone
		if self in cone:
			cone.remove(self)
		print "------------------"
		print "dis-connected"
		print cone
		print "-------------------"
	def on_message(self,message):
		global cone
		for i in cone:
			i.write_message(message)

def start():
	instance = tornado.ioloop.IOLoop.instance()
	instance.start()

app = Application([(r"/",SocketHandler)])
http_server = tornado.httpserver.HTTPServer(app)
http_server.listen(25252)
threading.Thread(target=start).start()
scheduler = sched.scheduler(time.time, time.sleep)
cone = []

def write_message_all(message):
	for i in cone:
		i.write_message(message)

def send_all_lines(view):
	region_all = Region(0, view.size())
	full_text = view.substr(region_all)
	lines = []
	for line in view.lines(region_all):
		lines.append(getLineObj(view, view.full_line(line)))
	obj_message = {
		'row': 'all',
		'lines': lines
	}
	write_message_all(json.dumps(obj_message))
	
class ServerCommand(TextCommand):
	def run(self, edit):
		pass
		
class SubliveEventListener(EventListener):
	def on_activated(self, view):
		send_all_lines(view)
	def on_modified(self, view):
		set_timeout(lambda: send_all_lines(view), 1)

		'''
		for sel in view.sel():
			row = view.rowcol(sel.a)[0]
			line = view.line(sel.a)
			obj_message = {
				'row': row,
				'line': getLineObj(view, view.full_line(line))
			}
			write_message_all(json.dumps(obj_message))
		'''

def getLineObj(view, line):
	n_max = line.b
	n = line.a
	region_word_prev = None
	obj = []
	while n < n_max:
		region_word = view.word(n)
		if region_word_prev and region_word.a - region_word_prev.b > 0:
			obj.append(
				(
					view.substr(Region(region_word_prev.b,region_word.a)).replace('\t', '  ' ).strip('\r\n'),
					''
					)
				)
		obj.append(
			(
				view.substr(region_word).replace('\t', '  ' ).strip('\r\n'),
				view.scope_name(region_word.a).replace('.', ' ')
			)
		)
		region_word_prev = region_word
		n = region_word.b + 1
	if region_word_prev and not line.b - region_word_prev.b:
		obj.append(
			(
				view.substr(Region(region_word_prev.b, line.b)).replace('\t', '  ' ).strip('\r\n'), 
				''
			)
		)
	return obj
