from django.http import HttpResponse,HttpResponseRedirect
from django.template import Context,Template
from django.template.loader import get_template
from django.shortcuts import render_to_response
from forms import InterfaceForm,UploadFileForm
from django.template import RequestContext
import Raw_Input
from zoneset.models import Zone,Interface,Device
import json


def search(request):
    if request.method == 'POST':
        form = InterfaceForm(request.POST)
        if form.is_valid():
            cd=form.cleaned_data
            intname = cd['name']
            devname = cd['device']
            interface=Interface.objects.get(name=intname,device=Device.objects.get(name=devname))
            zone = Zone.objects(interface=interface)
            if interface:
                return render_to_response('base.html',{'interface':interface, 'zone_list':zone})
    else:
        form = InterfaceForm(initial={'device': 'NF97SN0A-BK'})
    return render_to_response('interface_form.html', {'form': form},context_instance=RequestContext(request))

def js(request):
    a= json.loads(request.POST['data'])
    print a
    # print a
    # print a["interface"]
    intname = a["interface"]
    devname= a["device"]
    int_list=[]
    if devname and intname:
        interface=Interface.objects.get(name=intname,device=Device.objects.get(name=devname))
        result={"total_number":1,"result_list":[interface.doc_to_dict()]}
    elif devname:
        interface=Interface.objects(device=Device.objects.get(name=devname))
        for item in interface:
            int_list.append(item.doc_to_dict())
        result={"total_number":1,"result_list":int_list}
    elif intname:
        interface=Interface.objects(name=intname)
        for item in interface:
            int_list.append(item.doc_to_dict())
        result={"total_number":1,"result_list":int_list}
    # print json.dumps(result)
    return HttpResponse(json.dumps(result))
    #
    # return render_to_response('contact_form.html', {'form': form},context_instance=RequestContext(request))

def zoneq(request):
    a= json.loads(request.POST['data'])
    # print a
    # print a["wwpn"]
    wwpn = a["wwpn"]
    if wwpn:
        interface=Interface.objects.get(wwpn=wwpn)
        zones=Zone.objects(interface=interface)
        zone_list = []
        for item in zones:
            zone_list.append(item.doc_to_dict())
        result={"total_number":1,"result_list":zone_list}
    # print '----------------------------------'
    # print json.dumps(result)
    else:
        result={"total_number":0,"result_list":[]}
    return HttpResponse(json.dumps(result))

def form(request):
    return render_to_response('zone.html')

def zoneconfig_gen(request):
    return render_to_response('config.html')

def show(request):
    Raw_Input.unzip('/root/raw','/root/test')
    list = Raw_Input.traversaldir('/root/test')
    Raw_Input.get_device(list)
    Raw_Input.get_interface(list)
    Raw_Input.get_interface_detail(list)
    Raw_Input.get_zone(list)
    Raw_Input.get_fcalias(list)
    t = get_template('show.html')
    html = t.render(Context({'item_list':list}))
    return HttpResponse(html)

def upload(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            Raw_Input.handle_upload_file(request.FILES['file'])
            return HttpResponseRedirect('show')
    else:
        form=UploadFileForm()
    return render_to_response('upload.html',{'form': form},context_instance=RequestContext(request))

def zone_gen(request):
    a= json.loads(request.POST['data'])
    list=[]
    for item in a['wwpn'].split('-'):
        list.append(str(item))

    interface_list=[]
    members=''
    name=''
    vsan=''
    for i in list:
        interface_list.append(Interface.objects.get(wwpn=i))
    print interface_list
    for i in interface_list:
        if not vsan:
            vsan = i.vsan
            name=name+i.description.replace('(','_').replace(')','_')+'$'
            members = members + 'member interface '+i.name+' domain '+i.device.get_domain_byvsan(i.vsan)+'\n\r'
        elif vsan == i.vsan:
            name=name+i.description.replace('(','_').replace(')','_')+'$'
            members = members + 'member interface '+i.name+' domain '+i.device.get_domain_byvsan(i.vsan)+'\n\r'
        else:
            return 'the input include two wwpn in different vsan, please double check'
    zone_config = 'zone name ' +name+ ' vsan ' + vsan + '\n\r'+members
    print(json.dumps(zone_config))
    return HttpResponse(json.dumps(zone_config))

