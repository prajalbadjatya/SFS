import pandas as pd
import numpy as np
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
import nltk
import networkx as nx
import json
import sys
from sklearn.metrics.pairwise import cosine_similarity
# import os
# os.chdir(r'C:/Users/Mansi/Downloads/')
# os.getcwd()
# input= "Paragraphs are the building blocks of papers. Many students define paragraphs in terms of length: a paragraph is a group of at least five sentences, a paragraph is half a page long, etc. In reality, though, the unity and coherence of ideas among sentences is what constitutes a paragraph. A paragraph is defined as “a group of sentences or a single sentence that forms a unit” (Lunsford and Connors 116). Length and appearance do not determine whether a section in a paper is a paragraph. For instance, in some styles of writing, particularly journalistic styles, a paragraph can be just one sentence long. Ultimately, a paragraph is a sentence or group of sentences that support one main idea. In this handout, we will refer to this as the “controlling idea,” because it controls what happens in the rest of the paragraph."
input = sys.argv[1]
sentences=input.split('.')
    
#sentences=[y for x in sentences for y in x]
sentences=list(filter(None, sentences)) 

#removing punctuation and special character 
clean_sentences = pd.Series(sentences).str.replace("[^a-zA-Z]", " ")

# make alphabets lowercase
clean_sentences = [s.lower() for s in clean_sentences]
#clean_sentences = []

#for sen in sentences:
 #   clean_sen = pd.Series(sen).str.replace("[^(a-zA-Z)]", " ")
  #  clean_sentences.append(clean_sen)
   
#make alphabets lowercase
#for sen in clean_sentences:
 #   sen = [s.lower() for s in sen]
    #clean_sentences

stop_words = stopwords.words('english')

def remove_stopwords(sen):
    sen_new = " ".join([i for i in sen if i not in stop_words])
    return sen_new

clean_sentences = [remove_stopwords(r.split()) for r in clean_sentences]
    

lemmatizer=nltk.stem.WordNetLemmatizer()
for s in clean_sentences:
    lemmatizer.lemmatize(s)
        
word_embeddings = {}
f = open('dataset.txt', encoding='utf-8')
for line in f:
    values = line.split()
    word = values[0]
    coefs = np.asarray(values[1:], dtype='float32')
    word_embeddings[word] = coefs
f.close()

sentence_vectors = []
for i in clean_sentences:
    if len(i) != 0:
        v = sum([word_embeddings.get(w, np.zeros((100,))) for w in i.split()])/(len(i.split())+0.001)
    else:
        v = np.zeros((100,))
    sentence_vectors.append(v)
sim_mat = np.zeros([len(sentences), len(sentences)])

for i in range(len(sentences)):
    for j in range(len(sentences)):
        if i != j:
            sim_mat[i][j] = cosine_similarity(sentence_vectors[i].reshape(1,100), sentence_vectors[j].reshape(1,100))
            
nx_graph = nx.from_numpy_array(sim_mat)
scores = nx.pagerank(nx_graph)

ranked_sentences = sorted(((scores[i],s) for i,s in enumerate(sentences)), reverse=True)

summary=""
for i in range(5):
    summary=summary+" "+(ranked_sentences[i][1])
    
#summary = [s.strip() for s in summary]

output = {
    "summ": summary 
}
print(json.dumps(output))