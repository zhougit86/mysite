from django.conf.urls import patterns, include, url
from django.contrib import admin
# from books import views
from view import upload,show,search,js,form,zoneq,zoneconfig_gen,zone_gen

admin.autodiscover()

urlpatterns = patterns('',
    # (r'^search_form/$', views.search_form),
    # (r'^search/$', views.search),
    (r'^search_form/$',form),
    (r'^zonecon_gen/$',zoneconfig_gen),
    (r'^zone_query/$',zoneq),
    (r'^search/$',js),
    (r'^zoneconback/$',zone_gen),
    (r'^upload/$',upload),
    (r'^upload/show/$',show),
                       # Examples:
    # url(r'^$', 'mysite.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
)
