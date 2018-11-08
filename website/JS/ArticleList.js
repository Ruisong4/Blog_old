/**
 * Created by cabbage on 17/05/27.
 */



/*
* 过来可能带有的参数
* page 这是第几页
* dir 指定为什么类型的文章
* 或者说两个都有
* */

window.onload = function () {
    Bmob.initialize("ed4aedea541215a93b483fbe0e9c8bc3", "bcfdb82a2462b1e83a535b77ca8104ff");
    setInterval("document.getElementById(\"date\").innerHTML=new Date().toLocaleString()+' 星期'+'日一二三四五六'.charAt(new Date().getDay());",1000);
    //页面右上角时间标志
    if(Bmob.User.current()){
        document.getElementById("welcome").innerHTML = Bmob.User.current().get("username")+"，welcome to my blog  <u>LogOut<u>";
        document.getElementById("welcome").getElementsByTagName("u")[0].onclick = logout;
    }
    else{
        document.getElementById("welcome").innerHTML =" <a href='login.html?from=1'>LogIn</a>，wlcome to my blog";
    }

    //如果处于下级目录
    if(getParameter("dir")!=""){
        document.getElementById("bannerThird").innerHTML+= "  " + decodeURI(getParameter("dir"));
    }

    //开始从数据库读取数据 对Left div进行初始化
    var page = getParameter("page");
    var dir = decodeURI(getParameter("dir"));
    //检查url参数
    var Articles = Bmob.Object.extend("Articles");
    var query = new Bmob.Query(Articles);
    //创建query对象
    query.limit(8);
    //每一页最多返回8条信息
    if(dir!="")query.equalTo("type",dir);
    //如果处于分类目录 添加分类查询条件
    if(page!=""){
        query.skip((page-1)*8);
        document.getElementById("page").innerHTML = "page " + page;
    }
    //如果不是第一页就跳过前面的页数进行查询
    if(Bmob.User.current()){
        query.lessThanOrEqualTo("requestAuthority",Bmob.User.current().get("authority"))
    }
    else{
        query.equalTo("requestAuthority",0);
    }
    query.descending("timeDistant");
    query.find({
        success: function(results) {
            //alert(results.length);
            for(var i=0;i<results.length;i++){
                var obj = results[i]; //获取对象
                var thisItem = document.getElementsByClassName("Item")[i]; //获取相应item
                thisItem.getElementsByTagName("a")[0].innerHTML=obj.get("title"); //设置标题
                thisItem.getElementsByTagName("a")[0].href = "Articles.html?id="+ obj.id; //设置标题链接
                //title
                var ps = thisItem.getElementsByTagName("p");
                ps[0].innerHTML = obj.createdAt+"&nbsp;&nbsp;&nbsp;·";//设置时间
                thisItem.getElementsByTagName("a")[1].innerHTML=obj.get("type"); //设置分类
                thisItem.getElementsByTagName("a")[1].href = "ArticleList.html?dir="+ obj.get("type"); //设置分类链接
                ps[2].innerHTML =obj.get("view") + "views&nbsp;&nbsp;&nbsp;·";//设置观看人数
                ps[3].innerHTML = obj.get("comments")+" comments";
                //info
                thisItem.getElementsByClassName("ItemIntro")[0].innerHTML=obj.get("intro");
                //intro
                thisItem.style.visibility = "visible";
            }
            //循环处理返回结果
        },
        error: function(error) {
           alert("unknow erro accessing database："+error.message);
        }
    });
    //Left Div Item 加载逻辑完成

    //开始加载底部目录逻辑
    var query1 = new Bmob.Query(Articles);
    if(dir!="")query1.equalTo("type",dir);
    if(Bmob.User.current()){
        query1.lessThanOrEqualTo("requestAuthority",Bmob.User.current().get("authority"))
    }
    else{
        query1.equalTo("requestAuthority",0);
    }
    query1.count({
        success: function(count) {
            // 查询成功，返回记录数量
            //开始生成页码
            var count1 = count;
            var paging = document.getElementById("paging");
            var index = 1;
            while(count1>0){
                var a = document.createElement("a");
                a.innerHTML = index.toString();
                if(dir!="")a.href = "ArticleList.html?dir="+ decodeURI(getParameter("dir"))+"&page="+index;
                else a.href = "ArticleList.html?page="+index;
                paging.appendChild(a);
                paging.innerHTML+="&nbsp;&nbsp;&nbsp;";
                count1-=8;index++;
            }

        },
        error: function(error) {
            // 查询失败
            alert("unknow erro accessing statistic data："+ error.message);
        }
    });
    //结束加载left逻辑
    //下面开始加载right 逻辑
    var Comment = Bmob.Object.extend("comments");
    var commentQuery = new Bmob.Query(Comment);
    commentQuery.limit(10);
    commentQuery.descending("timeDistant");
    // 查询所有数据
    commentQuery.find({
        success: function(results) {
            if(results.length==0){
                document.getElementById("newestComments").innerHTML+="no new comment";
            }
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                var content = object.get("content");
                var name = object.get("createBy");
                var belongTo = object.get("belongTo");
                var a= document.createElement("a");
                a.style.display="block";
                a.innerHTML = name+"："+content;
                a.href = "Articles.html?id=" + belongTo;

                document.getElementById("newestComments").appendChild(a);
                document.getElementById("newestComments").appendChild(document.createElement("hr"));
            }
        },
        error: function(error) {
            alert("erro accessing comment: " + error.code + " " + error.message);
        }
    });

    //完成加载最新评论 开始加载目录
    var type = Bmob.Object.extend("Types");
    var typeQuery = new Bmob.Query(type);
    typeQuery.find({
        success: function(results) {
            if(results.length==0){
                document.getElementById("typeCata").innerHTML+="cannot find any dir";
            }
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                var typeName = object.get("typeName");

                var a= document.createElement("a");
                a.style.display="block";
                a.innerHTML = typeName;
                a.href = "ArticleList.html?dir=" + typeName;
                document.getElementById("typeCata").appendChild(a);
                document.getElementById("typeCata").appendChild(document.createElement("hr"));
            }
        },
        error: function(error) {
            alert("查询分类列表失败: " + error.code + " " + error.message);
        }
    });

    function getParameter(name) {
        var url = document.location.href;
        var start = url.indexOf("?")+1;
        if (start==0) {
            return "";
        }
        var value = "";
        var queryString = url.substring(start);
        var paraNames = queryString.split("&");
        for (var i=0; i<paraNames.length; i++) {
            if (name==getParameterName(paraNames[i])) {
                value = getParameterValue(paraNames[i])
            }
        }
        return value;
    }
    function getParameterName(str) {
        var start = str.indexOf("=");
        if (start==-1) {
            return str;
        }
        return str.substring(0,start);
    }

    function getParameterValue(str) {
        var start = str.indexOf("=");
        if (start==-1) {
            return "";
        }
        return str.substring(start+1);
    }

    function logout() {
        Bmob.User.logOut();
        window.open("ArticleList.html","_self");
    }
};