from django import forms


class InterfaceForm(forms.Form):
    name = forms.CharField(max_length=20)
    device = forms.CharField(max_length=20)

class UploadFileForm(forms.Form):
    title = forms.CharField(max_length=50)
    file = forms.FileField()