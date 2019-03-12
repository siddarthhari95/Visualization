import matplotlib
import json
from sklearn.decomposition import PCA
matplotlib.use("TkAgg")
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from sklearn.metrics import pairwise_distances
from flask import Flask
from flask import render_template
import pandas as pd
import sys
import matplotlib.pyplot as plt
import numpy as np
import random as random
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn import preprocessing
from flask import Flask
from flask import render_template
from sklearn import manifold
app = Flask(__name__)

sample_size = 500
scaler = StandardScaler()
random_samples = []
stratified_samples = []
features = []
# f = ['Apps','Accept','Enroll','Top10perc','Top25perc','F.Undergrad','P.Undergrad','Outstate','Room.Board','Books','Personal','PhD Terminal','S.F.Ratio','perc.alumn','Expend','Grad.Rate']

def preprocess():
    data_csv = pd.read_csv('College.csv', low_memory=False)
    del data_csv['Private']
    # data_csv = scaler.fit_transform(data_csv)
    return data_csv

# Task 1 -> Data Clustering and Decimation
def random_sampling(data_csv):
    global random_samples
    indices = random.sample(range(len(data_csv)), 100)
    data = np.array(data_csv)
    for i in indices:
        random_samples.append(data[i])

def cluster_data(data_csv, k):
    # Y = preprocessing.normalize(data_csv.values, norm='l2')
    km = KMeans(n_clusters=k).fit(data_csv)
    data_csv['cls'] = pd.Series(km.labels_)

def stratified_sampling(data_csv, k=4):
    global stratified_samples
    global sample_size
    cluster_data(data_csv, k)
    cl0 = data_csv[data_csv['cls'] == 0]
    cls0_size = len(cl0) * sample_size / len(data_csv)
    cl1 = data_csv[data_csv['cls'] == 1]
    cls1_size = len(cl1) * sample_size / len(data_csv)
    cl2 = data_csv[data_csv['cls'] == 2]
    cls2_size = len(cl2) * sample_size / len(data_csv)
    cl3 = data_csv[data_csv['cls'] == 3]
    cls3_size = len(cl3) * sample_size / len(data_csv)
    # import pdb; pdb.set_trace()
    cluster0 = cl0.ix[random.sample(list(cl0.index), int(cls0_size))]
    cluster1 = cl1.ix[random.sample(list(cl1.index), int(cls1_size))]
    cluster2 = cl2.ix[random.sample(list(cl2.index), int(cls2_size))]
    cluster3 = cl3.ix[random.sample(list(cl3.index), int(cls3_size))]

    stratified_samples = pd.concat([cluster0, cluster1, cluster2, cluster3])

def k_means_elbow(data_values):
    arr = []
    for i in range(1,20):
        kmeans = KMeans(n_clusters=i, init='k-means++', max_iter=300, n_init=10, random_state=0).fit(data_values)
        arr.append(kmeans.inertia_)
    plt.plot(range(1,20), arr)
    plt.title('Elbow')
    plt.xlabel('Cluster')
    plt.ylabel('arr')
    plt.show()

@app.route("/pca_scree")
def adaptive_scree():
    global stratified_samples
    print(stratified_samples)
    eigens = eigen_values_gen(stratified_samples)
    print(eigens[0])
    print(type(eigens[0]))
    return pd.json.dumps(eigens[0])

# Task 2 -> Dimensionality reduction
def pca_dimensionality(data_csv, k=4):
    eigens = eigen_values_gen(data_csv)
    print(eigens)
    squared = []
    limit = len(eigens[1])
    for i in range(0, limit):
        sum_val = 0
        for j in range(0, k):
            sum_val = sum_val + eigens[1][j][i] * eigens[1][j][i]
        squared.append(sum_val)
    print('squaredLoadings', squared)
    # print eigenValues
    # plt.plot(eigenValues)
    # plt.show()
    return squared

@app.route('/pca_random')
def pca_random():
    data_columns = []
    try:
        # import pdb; pdb.set_trace()
        global random_samples
        global features
        global sample_size
        pca = PCA(n_components=2)
        inputs = random_samples
        pca.fit(inputs)
        inputs = pca.transform(inputs)
        data_columns = pd.DataFrame(inputs)
        data_columns['cls'] = data_csv['cls']
    except:
        print(sys.exc_info()[0])
    return pd.json.dumps(data_columns)

@app.route('/pca_stratified')
def pca_stratified():
    data_columns = []
    try:
        # import pdb; pdb.set_trace()
        global stratified_samples
        global features
        global sample_size
        pca = PCA(n_components=2)
        inputs = stratified_samples
        pca.fit(inputs)
        inputs = pca.transform(inputs)
        data_columns = pd.DataFrame(inputs)
        data_columns['cls'] = data_csv['cls']
    except:
        print(sys.exc_info()[0])
    return pd.json.dumps(data_columns)

@app.route('/mds_euclidean_random')
def mds_euclidean_random():
    data_columns = []
    try:
        global random_samples
        import pdb; pdb.set_trace()
        inputs = random_samples
        mds_data = manifold.MDS(n_components=2, dissimilarity='precomputed')
        similarity = pairwise_distances(inputs, metric='euclidean')
        X = mds_data.fit_transform(similarity)
        data_columns = pd.DataFrame(X)
        # for i in range(0, 3):
        #     data_columns[ftrs[imp_ftrs[i]]] = data_csv_original[ftrs[imp_ftrs[i]]][:samplesize]
        data_columns['cls'] = data_csv['cls']
    except:
        print(sys.exc_info()[0])
    return pd.json.dumps(data_columns)

@app.route('/mds_euclidean_stratified')
def mds_euclidean_stratified():
    data_columns = []
    try:
        global stratified_samples
        import pdb; pdb.set_trace()
        inputs = stratified_samples
        mds_data = manifold.MDS(n_components=2, dissimilarity='precomputed')
        similarity = pairwise_distances(inputs, metric='euclidean')
        X = mds_data.fit_transform(similarity)
        data_columns = pd.DataFrame(X)
        data_columns['cls'] = data_csv['cls']
    except:
        print(sys.exc_info()[0])
    return pd.json.dumps(data_columns)

@app.route('/mds_euclidean_correlation_random')
def mds_euclidean_correlation_random():
    data_columns = []
    try:
        global random_samples
        import pdb; pdb.set_trace()
        inputs = random_samples
        mds_data = manifold.MDS(n_components=2, dissimilarity='precomputed')
        similarity = pairwise_distances(inputs, metric='correlation')
        X = mds_data.fit_transform(similarity)
        data_columns = pd.DataFrame(X)
        data_columns['cls'] = data_csv['cls']
    except:
        print(sys.exc_info()[0])
    return pd.json.dumps(data_columns)

@app.route('/mds_euclidean_correlation_stratified')
def mds_euclidean_correlation_stratified():
    data_columns = []
    try:
        global stratified_samples
        import pdb; pdb.set_trace()
        inputs = stratified_samples
        mds_data = manifold.MDS(n_components=2, dissimilarity='precomputed')
        similarity = pairwise_distances(inputs, metric='correlation')
        X = mds_data.fit_transform(similarity)
        data_columns = pd.DataFrame(X)
        data_columns['cls'] = data_csv['cls']
    except:
        print(sys.exc_info()[0])
    return pd.json.dumps(data_columns)

# @app.route('/scatter_matrix_random')
# def scatter_matrix_random():
#     try:
#         global random_samples
#         global imp_ftrs
#         data_columns = pandas.DataFrame()
#         for i in range(0, 3):
#             data_columns[ftrs[imp_ftrs[i]]] = data_csv_original[ftrs[imp_ftrs[i]]][:samplesize]

#         data_columns['clusterid'] = data_csv['kcluster'][:samplesize]
#     except:
#         e = sys.exc_info()[0]
#         print(e)

#     return pandas.json.dumps(data_columns)

# @app.route('/scatter_matrix_adaptive')
# def scatter_matrix_adaptive():
#     try:
#         global imp_ftrs
#         data_columns = pandas.DataFrame()
#         for i in range(0, 3):
#             data_columns[ftrs[imp_ftrs[i]]] = adaptive_samples[ftrs[imp_ftrs[i]]][:samplesize]

#         data_columns['clusterid'] = np.nan
#         for index, row in adaptive_samples.iterrows():
#             data_columns['clusterid'][index] = row['kcluster']
#         data_columns = data_columns.reset_index(drop=True)
#     except:
#         e = sys.exc_info()[0]
#         print e
#     return pandas.json.dumps(data_columns)

def eigen_values_gen(data_in):
    data_in = scaler.fit_transform(data_in)
    covariance_matrix = np.cov(data_in.T)
    eigens = np.linalg.eig(covariance_matrix)
    ind = eigens[0].argsort()
    index = ind[::-1]
    eigens_ret = []
    eigens_ret.append(eigens[0][index])
    eigens_ret.append(eigens[1][:, index])
    return eigens_ret

# Task 3 -> visualization
data_csv = preprocess()
values = preprocessing.normalize(data_csv.values, norm='l2')
# k_means_elbow(values)
random_sampling(data_csv)
stratified_sampling(data_csv)
sq_loads = pca_dimensionality(data_csv)
features = sorted(range(len(sq_loads)), key=lambda k: sq_loads[k], reverse=True)
