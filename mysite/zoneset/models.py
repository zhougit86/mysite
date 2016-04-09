from mongoengine import *
# Create your models here.

connect('zoneset')


class Device(Document):
    name = StringField(max_length=50,unique=True)
    domain = ListField(StringField(max_length=20))
    principalvsan = ListField(IntField())
    area = StringField(max_length=5)
    fabric = ListField(StringField(max_length=30))
    def __unicode__(self):
        return self.name
    def doc_to_dict(self):
        json={'name':self.name,'area':self.area}
        domain_list={}
        if self.domain:
            for item in self.domain:
                domain_list[item.split('$')[0]]=item.split('$')[1]
            json['domain']=domain_list
        fabric_list={}
        if self.fabric:
            for item in self.fabric:
                fabric_list[item.split('$')[0]]=item.split('$')[1]
            json['fabric']=fabric_list
        principle_list=[]
        if self.principalvsan:
            for item in self.principalvsan:
                principle_list.append(item)
            json['principalvsan']=principle_list
        return json
    def get_domain_byvsan(self,vsan):
        domain=''
        for item in self.domain:
            if item.split('$')[0]==vsan:
                domain=item.split('$')[1]
        return domain
    def get_fabric_byvsan(self,vsan):
        fabric=''
        for item in self.fabric:
            if item.split('$')[0]==vsan:
                fabric=item.split('$')[1]
        return fabric

class Interface(Document):
    name = StringField(max_length=10,unique=True,unique_with='device')
    vsan = StringField(max_length=5,default='1')
    device = ReferenceField(Device)
    status = StringField(max_length=20,default='down')
    fcid = StringField(max_length=10, blank=True)
    wwpn = StringField(max_length=30, blank=True)
    power = FloatField(default=-40)
    lastchange = DateTimeField()
    description = StringField(max_length=30, blank=True)
    mode = StringField(max_length=8,blank=True)
    # class Meta:
    #     unique_together = (("name", "domain"),)
    def __unicode__(self):
        return u'%s in %s vsan %s' %(self.name, self.device, self.vsan)
    def doc_to_dict(self):
        json={'name':self.name,'vsan':self.vsan,\
              'device':self.device.name,'status':self.status,\
              'power':self.power}
        if self.lastchange:
            json['lastchange']=self.lastchange.strftime('%Y-%m-%d %H:%M:%S')
        if self.description:
            json['description']=self.description
        if self.mode:
            json['mode']=self.mode
        if self.fcid:
            json['fcid']=self.fcid
        if self.wwpn:
            json['wwpn']=self.wwpn
        return json

class Fcalias(Document):
    name = StringField(max_length=50,unique=True,unique_with='vsan')
    interface = ListField(ReferenceField(Interface),default=[])
    vsan = StringField(max_length=5,default='1')
    area = StringField(max_length=5)
    def __unicode__(self):
        return u'%s in vsan %s' %(self.name,self.vsan)
    def doc_to_dict(self):
        list=[]
        if self.interface:
            for member in self.interface:
                member_dict=member.doc_to_dict()
                list.append(member_dict)
        json={'name':self.name,'vsan':self.vsan,'area':self.area,\
              'interface':list}
        return json

class Zone(Document):
    name = StringField(max_length=50,unique=True,unique_with='vsan')
    interface = ListField(ReferenceField(Interface),default=[])
    fcalias = ReferenceField(Fcalias)
    vsan = StringField(max_length=5,default='1')
    area = StringField(max_length=5)
    def __unicode__(self):
        return u'%s in vsan %s' %(self.name,self.vsan)
    def doc_to_dict(self):
        list=[]
        if self.interface:
            for member in self.interface:
                member_dict=member.doc_to_dict()
                list.append(member_dict)
        json={'name':self.name,'vsan':self.vsan,'area':self.area,\
              'interface':list}
        return json

