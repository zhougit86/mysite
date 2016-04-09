import zipfile
import glob
import os
import os.path
import shutil
import re
from zoneset.models import Zone,Interface,Device,Fcalias
import datetime


def unzip(dir,dest):
    filepath = zipfile.ZipFile(dir,'r')
    shutil.rmtree(dest)
    filepath.extractall(dest)
    filepath.close()

def traversaldir(path):
    filelist=[]
    for fname in glob.glob(path + os.sep + '*'):
        if os.path.isdir(fname):
            for name in traversaldir(fname):
                filelist.append(name)
        else:
            filelist.append(fname)
    return filelist

def handle_upload_file(f):
    destination = open('/root/raw','wb+')
    for chunk in f.chunks():
        destination.write(chunk)
    destination.close()

def get_device(filename):
    for i in filename:
        if 'fcdomain domain-list' in i:
            file_object = open(i)
            domain_list=[]
            principal_list=[]
            fabric_list=[]
            try:
                all_the_text_lines = file_object.readlines()
            finally:
                file_object.close()
            device_name = all_the_text_lines[0].split('#')[0]
            all_the_text_lines.reverse()
            while True:
                try:
                    temp = all_the_text_lines.pop()
                    if 'VSAN' in temp:
                        vsan_temp=str(re.search('\d*',re.split(' *',temp)[1]).group(0))
                        while True:
                            temp = all_the_text_lines.pop()
                            if 'Principal' in temp:
                                if not vsan_temp=='1':
                                    fabric_temp= re.search(r'(.*)\((.*)\)( *)([\d:a-f]*)( *)',temp).group(4)
                                    fabric_list.append(vsan_temp+'$'+fabric_temp)
                            if 'Local' in temp:
                                if not vsan_temp=='1':
                                    domain_list.append(vsan_temp+'$'+(temp.split('(')[1].split(')')[0]))
                                    if 'Principal' in temp:
                                        principal_list.append(vsan_temp)
                                break
                except IndexError:
                    break
            Device.objects(name = device_name).update(domain = domain_list,principalvsan = principal_list,area = device_name.split('-')[1],fabric=fabric_list,upsert = True)

def get_interface(filename):
    for i in filename:
        if 'show interface brief' in i:
            file_object = open(i)

            try:
                all_the_text_lines = file_object.readlines()
            finally:
                file_object.close()
            domain_input = intern(i.split('.')[3].split('_')[0])
            device_name = all_the_text_lines[0].split('#')[0]
            for j in all_the_text_lines:
                if '/' in j and 'mgmt' not in j:
                    # print(re.split(' *',j)[0])
                    Interface.objects(name=re.split(' *',j)[0],device=Device.objects.get(name=device_name)).update( mode = re.split(' *',j)[6] ,status= re.split(' *',j)[4], vsan=re.split(' *',j)[1], upsert = True)

def get_interface_detail(filename):
    MonthDict={'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}
    for i in filename:
        if 'show flogi database.txt' in i:
            file_object = open(i)
            try:
                all_the_text_lines = file_object.readlines()
            finally:
                file_object.close()
            # domain_input = intern(i.split('.')[3].split('_')[0])
            device_name = all_the_text_lines[0].split('#')[0]
            for j in all_the_text_lines:
                if '/' in j and 'mgmt' not in j:
                    Interface.objects.get(name=re.split(' *',j)[0],device=Device.objects.get(name=device_name)).update(fcid=re.split(' *',j)[2],wwpn = re.split(' *',j)[3])
        if 'show interface transceiver details' in i:
            file_object = open(i)
            try:
                all_the_text_lines = file_object.readlines()
            finally:
                file_object.close()
            device_name = all_the_text_lines[0].split('#')[0]
            all_the_text_lines.reverse()
            while True:
                try:
                    temp = all_the_text_lines.pop()
                    if 'sfp is present' in temp:
                        interface_temp=re.split(' *',temp)[0]
                        while True:
                            temp = all_the_text_lines.pop()
                            if 'Rx Power' in temp:
                                try:
                                    rx=float(re.search(r'( *)Rx Power( *)(-\d*.\d*)( *)dBm',temp).group(3))
                                except AttributeError:
                                    rx=-40
                                Interface.objects(name=interface_temp,device=Device.objects.get(name=device_name)).update(power=rx,upsert=True)
                                break
                except IndexError:
                    break
        if 'show interface.txt' in i:
            file_object = open(i)
            try:
                all_the_text_lines = file_object.readlines()
            finally:
                file_object.close()
            device_name = all_the_text_lines[0].split('#')[0]
            all_the_text_lines.reverse()
            while True:
                try:
                    temp = all_the_text_lines.pop()
                    if 'is up' in temp and 'channel' not in temp:
                        interface_temp=re.split(' *',temp)[0]
                        if 'NF97SN0A-BK' in device_name:
                            print (temp,device_name)

                        while True:
                            temp = all_the_text_lines.pop()

                            if 'Port description' in temp:
                                c = re.search(r'Port description is (.*)(\r)',temp)
                                Interface.objects(name=interface_temp,device=Device.objects.get(name=device_name)).update(description=c.group(1),upsert=True)
                            if 'Interface last changed' in temp:
                                c= re.search(r'(.*) (\w{3,}) ( *)(\d*) ( *)(\d*):(\d*):(\d*) ( *)(\d*)',temp)
                                tm = datetime.datetime(year=int(c.group(10)),month=MonthDict[c.group(2)],day=int(c.group(4)),hour=int(c.group(6)),minute=int(c.group(7)),second=int(c.group(8)))
                                Interface.objects(name=interface_temp,device=Device.objects.get(name=device_name)).update(lastchange=tm,upsert=True)
                                break
                            if 'Port mode is E' in temp:
                                break
                except IndexError:
                    break

def get_zone(filename):
    for i in filename:
        if 'show zoneset active' in i:
            file_object = open(i)
            try:
                all_the_text_lines = file_object.readlines()
            finally:
                file_object.close()
            device_name = all_the_text_lines[0].split('#')[0]
            function = device_name.split('-')[1]
            device = Device.objects(name = device_name).first()
            if device.principalvsan:
                all_the_text_lines.reverse()
                while True:
                    try:
                        temp = all_the_text_lines.pop()
                        if 'zone name' in temp and 'vsan' in temp:
                            int_list=[]
                            zone_name = re.search(r'zone name (.*) vsan( *)(\d*)',temp).group(1)
                            vsan_name = re.search(r'zone name (.*) vsan( *)(\d*)',temp).group(3)
                            while True:
                                temp = all_the_text_lines.pop()
                                if 'interface' in temp and 'domain-id' in temp:
                                    int_name = re.search(r'interface (.*) domain-id ( *)(\d*)',temp).group(1)
                                    domain_name = re.search(r'interface (.*) domain-id ( *)(\d*)',temp).group(3)
                                    int_list.extend(Interface.objects(name = int_name, device=Device.objects(area = function,domain__in = [vsan_name+'$'+domain_name]).first()))
                                else:
                                    # print(int_list)
                                    Zone.objects(name = zone_name, vsan = vsan_name,).update(interface = int_list, area=function,upsert=True)

                                    break
                    except IndexError:
                        break

def get_fcalias(filename):
    for i in filename:
        if 'show fcalias.txt' in i:
            file_object = open(i)
            try:
                all_the_text_lines = file_object.readlines()
            finally:
                file_object.close()
            device_name = all_the_text_lines[0].split('#')[0]
            function = device_name.split('-')[1]
            device = Device.objects(name = device_name).first()
            if device.principalvsan:
                all_the_text_lines.reverse()
                while True:
                    try:
                        temp = all_the_text_lines.pop()
                        if 'fcalias name' in temp:
                            alias_name = re.search(r'fcalias name (.*) vsan ( *)(\d*)',temp).group(1)
                            vsan_name = re.search(r'fcalias name (.*) vsan ( *)(\d*)',temp).group(3)
                            int_list = []
                            while True:
                                temp = all_the_text_lines.pop()
                                if 'interface' in temp and 'domain-id' in temp:
                                    int_name = re.search(r'interface (.*) domain-id ( *)(\d*)',temp).group(1)
                                    domain_name = re.search(r'interface (.*) domain-id ( *)(\d*)',temp).group(3)
                                    int_list.extend(Interface.objects(name = int_name, device=Device.objects(area = function,domain__in = [vsan_name+'$'+domain_name]).first()))

                                else:
                                    # print(int_list)
                                    Fcalias.objects(name = alias_name, vsan = vsan_name,).update(interface = int_list, area=function,upsert=True)
                                    break
                    except IndexError:
                        break

def zone_gen(list):
    interface_list=[]
    members=''
    name=''
    vsan=''
    for i in list:
        interface_list.append(Interface.objects.get(wwpn=i))

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
    return zone_config

