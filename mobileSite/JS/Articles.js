/**
 * Created by cabbage on 17/05/28.
 */
window.onload = function () {
    Bmob.initialize("ed4aedea541215a93b483fbe0e9c8bc3", "bcfdb82a2462b1e83a535b77ca8104ff");
    //初始化bmob服务

    if(getParameter("id")==""){
        alert("访问错误页面将重新导向");
        window.open("ArticleList.html","_self");
    }
    //如果这是一次不带参数的访问 那么就将页面重新导向到目录页

    /*
    if(Bmob.User.current()){
        document.getElementById("welcome").innerHTML = Bmob.User.current().get("username")+"，欢迎来到我的博客  <u>注销<u>";
        document.getElementById("welcome").getElementsByTagName("u")[0].onclick = logout;
        document.getElementById("commenter").value = Bmob.User.current().get("username");
        //如果用户登录 就修改网页ui
    }
    else{
        document.getElementById("welcome").innerHTML =" <a href='login.html?from=2&id="+ getParameter("id")+"'>请登录</a>，欢迎来到我的博客";
    }
    //登录和注销逻辑
    */
    //开始从数据库拉取数据
    var Articles = Bmob.Object.extend("Articles");
    //创建查询对象，入口参数是对象类的实例
    var query = new Bmob.Query(Articles);
    //查询单条数据，第一个参数是这条数据的objectId值
    query.get(getParameter("id"), {
        success: function(gameScore) {
            document.getElementsByTagName("title")[0].innerHTML = gameScore.get("title") + "-李瑞崧的个人博客"
            if(Bmob.User.current()){
               if(gameScore.get("requestAuthority")>Bmob.User.current().get("authority")){
                   alert("没有权限的访问，需要更高权限账号");
                   window.open("ArticleList.html","_self");
               }
            }
            else{
                if(gameScore.get("requestAuthority")!=0){
                    alert("没有权限的访问，需要更高权限账号");
                    window.open("ArticleList.html","_self");
                }
            }
            // 检查阅读权限
            // 查询成功，调用get方法获取对应属性的值
            document.getElementById("title").innerHTML = gameScore.get("title");
            //获取标题 放置
            document.getElementById("time").innerHTML = gameScore.createdAt+"&nbsp;&nbsp;&nbsp;·";
            document.getElementById("type").getElementsByTagName("a")[0].innerHTML=gameScore.get("type"); //设置分类
            document.getElementById("type").getElementsByTagName("a")[0].href = "ArticleList.html?dir="+ gameScore.get("type"); //设置分类链接

            //结束 info 逻辑
            //开始正文逻辑 替换pre 标签
            var ArticleContent = gameScore.get("content");
            document.getElementById("content").innerHTML = ArticleContent;
            var pres = document.getElementsByTagName("pre");
            for(var i=0;i<pres.length;i++){
                var temp =  pres[i].innerHTML;
                pres[i].innerHTML = "<code class=\"language-javascript\">"+temp+"</code>";
            }
            Prism.highlightAll();
            //高亮显示所有代码部分
            var viewer = gameScore.get("view");
            gameScore.set("view",viewer+1);
            gameScore.save();
        },
        error: function(object, error) {
            // 查询失败
            alert("拉取文章失败，错误描述："+error.message);
        }
    });
    //文章部分加载完成 开始加载评论部分
    //设置评论提交逻辑
    document.getElementById("uploadComment").onclick = function () {
        var commenter = document.getElementById("commenter").value;
        var commentContent = document.getElementById("commentContent").value;
        //获取回复信息
        if(commentContent.trim()==""){
            alert("评论内容不能为空");
            return;
        }
       //检查是否空
        var d1=new Date("2004/09/16 20:08:00");
        var d2=new Date();
        //获取时间戳
        commenter.trim()==""?commenter="匿名游客":commenter;
        if(this.what=="reply"){
            var comments = Bmob.Object.extend("comments");
            var queryW = new Bmob.Query(comments);

            queryW.get(this.toWhat, {
                success: function(gameScore) {
                    gameScore.add("replys",{"name":commenter,"content":commentContent});
                    gameScore.save();
                    alert("回复已提交");
                    window.location.reload(true);
                    return;
                },
                error: function(object, error) {
                    alert("回复失败")
                }
            });
        //如果执行的是回复逻辑 那么就执行上面这一段逻辑
        }
        else{
        //如果不是活肤逻辑那就是评论逻辑 就执行下面的逻辑
        var newComment = Bmob.Object.extend("comments");
        var thisComment = new newComment();
        thisComment.set("createBy",commenter);
        thisComment.set("belongTo",getParameter("id"));
        thisComment.set("content",commentContent);
        thisComment.set("timeDistant",d2-d1);
        thisComment.save(null, {
            success: function(gameScore) {
                // 添加成功
                var Articles = Bmob.Object.extend("Articles");
                //创建查询对象，入口参数是对象类的实例
                var queryA = new Bmob.Query(Articles);
                //查询单条数据，第一个参数是这条数据的objectId值
                queryA.get(getParameter("id"), {
                    success: function(gameScore) {
                        // 获取到当前回复的评论的实例对象
                        var comments = gameScore.get("comments");
                        gameScore.set("comments",comments+1);
                        gameScore.save();
                    },
                    error: function(object, error) {
                        alert("拉取文章失败，错误描述：" + error.message);
                    }
                });
                alert("评论已提交");
                window.location.reload(true);
            },
            error: function(gameScore, error) {
                // 添加失败
                alert('添加数据失败，返回错误信息：' + error.message);
            }
        });
        }
    };
    //评论提交逻辑完成 开始拉取评论

    var Comment = Bmob.Object.extend("comments");
    var commentQuery = new Bmob.Query(Comment);
    commentQuery.equalTo("belongTo",getParameter("id"));
    commentQuery.descending("timeDistant");
    commentQuery.find({
        success: function(results) {
            // 循环处理查询到的数据
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                var createBy = object.get("createBy");
                var comment = object.get("content");
                var replies = object.get("replys");

                var commentDiv = document.createElement("div");
                commentDiv.className = "comments" ;
                commentDiv.innerHTML = createBy + " 说："+comment+"<br/>";
                var x = document.createElement("p");
                x.innerHTML = "回复";
                x.replyTo = object.id;
                x.className = "reply";
                if(replies!=undefined){
                    for(var q=0;q<replies.length;q++){
                        commentDiv.innerHTML+= "<br/><p>"+replies[q].name+"  回复  说： "+ replies[q].content+"</p>";
                    }
                }
                commentDiv.appendChild(x);
                document.getElementById("commentContainer").appendChild(commentDiv);
                var replyE = document.getElementsByClassName("reply");
                for(var q=0;q<replyE.length;q++){
                    replyE[q].onclick = function () {
                        document.getElementById("uploadComment").scrollIntoView();
                        document.getElementById("uploadComment").what = "reply";
                        document.getElementById("uploadComment").toWhat = this.replyTo;
                        document.getElementById("uploadComment").value = "发布回复";
                    };
                }

            }
        },
        error: function(error) {
            alert("查询失败: " + error.code + " " + error.message);
        }
    });

    var type = Bmob.Object.extend("Types");
    var typeQuery = new Bmob.Query(type);
    typeQuery.find({
        success: function(results) {
            if(results.length==0){
                document.getElementById("typeCata").innerHTML+="没有任何分类";
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

    //加载右边最新文章部分
    /*
    var Article = Bmob.Object.extend("Articles");
    var articleQuery = new Bmob.Query(Article);
    articleQuery.limit(10);
    articleQuery.descending("timeDistant");
    // 查询所有数据
    articleQuery.find({
        success: function(results) {
            if(results.length==0){
                document.getElementById("newestArticle").innerHTML+="没有最新文章";
            }
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                var title = object.get("title");
                var a= document.createElement("a");
                a.style.display="block";
                a.innerHTML = title;
                a.href = "Articles.html?id=" + object.id;

                document.getElementById("newestArticle").appendChild(a);
                document.getElementById("newestArticle").appendChild(document.createElement("hr"));
            }
        },
        error: function(error) {
            alert("查询最新文章失败: " + error.code + " " + error.message);
        }
    });
    */
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