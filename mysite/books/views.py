from django.shortcuts import render,render_to_response
from django.http import HttpResponse
from mysite.books.models import Book

# Create your views here.
def search_form(request):
    return render_to_response('search.html')

def search(request):
    if 'q' in request.GET:
        q = request.GET['q'] and request.GET['q']
        books = Book.objects.filter(title__icontains=q)
        return render_to_response('search_results.html',
            {'books': books, 'query': q})
    else:
        return HttpResponse('no input')