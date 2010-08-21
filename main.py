from google.appengine.ext import webapp
from google.appengine.ext.webapp import util, template
from google.appengine.api import urlfetch, memcache
import base64, time, urllib, logging

# Make sure you make a keys.py file with these
from keys import ACCOUNT_SID, AUTH_TOKEN

def baseN(num,b=36,numerals="0123456789abcdefghijklmnopqrstuvwxyz"): 
    return ((num == 0) and  "0" ) or (baseN(num // b, b).lstrip("0") + numerals[num % b])

class MainHandler(webapp.RequestHandler):
    def get(self):
        self.response.out.write(template.render('main.html', locals()))
    
    def post(self):
        battle = baseN(abs(hash(time.time())))
        resp = urlfetch.fetch('https://%s.twiliort.com/-/experimental/accesstoken' % ACCOUNT_SID, method='POST', 
            headers={"Authorization": "Basic "+base64.b64encode('%s:' % AUTH_TOKEN)},
            payload=urllib.urlencode({
                'expires': int(time.time())+3600, 
                'path': "/%s" % battle, 
                'listen': 'true', 
                'publish': 'true'}))
        access_token = resp.content
        memcache.set(battle, access_token)
        self.redirect('/%s' % battle)

class BattleHandler(webapp.RequestHandler):
    def get(self, battle):
        self.response.out.write(template.render('battle.html', {
            'account_sid': ACCOUNT_SID, 
            'battle': battle,
            'access_token': memcache.get(battle)}))
    
    def post(self, battle):
        if self.request.query_string == 'send':
            resp = urlfetch.fetch('https://%s.twiliort.com/%s' % (ACCOUNT_SID, battle), method='POST', 
                headers={"Authorization": "Basic "+base64.b64encode('%s:' % memcache.get(battle))},
                payload=self.request.body)
            logging.info(resp.content)


def main():
    application = webapp.WSGIApplication([('/', MainHandler), ('/(.*)', BattleHandler)], debug=True)
    util.run_wsgi_app(application)

if __name__ == '__main__':
    main()
