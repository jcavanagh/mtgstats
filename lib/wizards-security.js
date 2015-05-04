var xmlNamespaces = {
    saml: "urn:oasis:names:tc:SAML:2.0:assertion",
    samlp: "urn:oasis:names:tc:SAML:2.0:protocol",
    s: "http://schemas.xmlsoap.org/soap/envelope/",
    wiz: "http://www.wizards.com/Service/2013-03",
    sig: "http://www.w3.org/2000/09/xmldsig#",
    xs: "http://www.w3.org/2001/XMLSchema",
    xsi: "http://www.w3.org/2001/XMLSchema-instance"
};

//***********************************************************************
// Below this point is their "SamlWidget" library for whatever "ESSO" is
//***********************************************************************
function debug(msg) {
    //Do nothing
}
function ESSOConfig() {
}
function ESSOContext() {
}
function ESSOConstants() {
}
function loadFlagConfiguration() {
    // return flagsSet = jQuery.cookie(ESSOConstants.flagsSet), flagsSet == ESSOConstants.essoUndefined ? (jQuery.ajax({url: ESSOConstants.jsonFlag,dataType: ESSOConstants.json,async: !1,contentType: ESSOConstants.appJson}).success(function(n) {
    //     try {
    //         var i, t;
    //         for (currentDomain = getCurrentDomain(), i = n.flagdata.length, t = 0; t < i; )
    //             jQuery.each(n.flagdata[t], function(n, t) {
    //                 flags = t == ESSOConstants.flagsAvailable ? flags != undefined ? flags + ESSOConstants.setTrue : ESSOConstants.setTrue : flags != undefined ? flags + ESSOConstants.setFalse : ESSOConstants.setFalse
    //             }), t++;
    //         jQuery.cookie(currentDomain, flags, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain,expires: ESSOConfig.expiryDays})
    //     } catch (r) {
    //         return ESSOConstants.essoFalse
    //     }
    // }), flagsSet = ESSOConstants.essoTrue, jQuery.cookie(ESSOConstants.flagsSet, flagsSet, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain,expires: ESSOConfig.expiryDays}), ESSOConstants.essoTrue) : void 0
}
function loadWidget() {
    var n = ESSOConstants.essoFalse, t;
    try {
        return t = getCurrentDomain(), setFlagVariables(t), n = ESSOConstants.essoTrue
    } catch (i) {
        return n
    }
}
function policyvariables() {
    return SingletonloadConfiguration.getInstance()
}
function loadDomainSettings() {
    loadResult = ESSOConstants.essoFalse;
    try {
        if (ESSOContext.reqreAuthentication == ESSOConstants.reqReAuthentication)
            return loadResult = ESSOConstants.essoFalse;
        if (ESSOContext.maintainSession == ESSOConstants.setMaintainSession) {
            var n = jQuery.cookie(ESSOConstants.samlToken);
            if (n != ESSOConstants.undefined && n != ESSOConstants.stringNull && loadToken(n) == ESSOConstants.essoTrue)
                return ESSOConstants.essoTrue
        }
        return loadResult = ESSOContext.acceptRememberMe == ESSOConstants.essoTrue ? authenticateByRememberMe(ESSOContext.saveToken === ESSOConstants.essoTrue) : ESSOConstants.essoFalse
    } catch (t) {
        loadResult = ESSOConstants.essoFalse
    }
    return loadResult
}
function loadToken(n) {
    ESSOContext.isAuthenticated = ESSOConstants.essoFalse;
    try {
        n != ESSOConstants.undefined && n != ESSOConstants.stringNull && (samlTokenCookieObj = jQuery.deparam(n), ESSOContext.samlToken = samlTokenCookieObj, ESSOContext.isAuthenticated = ESSOConstants.essoTrue)
    } catch (t) {
        debug("Error in loadToken.")
    }
    return ESSOContext.isAuthenticated
}
function getCurrentDomain() {
    URL = window.location.href;
    var n = URL.split("//"), t = n[1], i = t.split("/");
    return i[0]
}
function setFlagVariables(n) {
    var t = jQuery.cookie(n);
    if (t != ESSOConstants.essoUndefined)
        ESSOContext.reqreAuthentication = t.substring(0, 1), ESSOContext.maintainSession = t.substring(1, 2), ESSOContext.acceptRememberMe = t.substring(2, 3) == ESSOConstants.setTrue ? ESSOConstants.essoTrue : ESSOConstants.essoFalse, debug("setFlagVariables: " + JSON.stringify({reqreAuthentication: ESSOContext.reqreAuthentication,maintainSession: ESSOContext.maintainSession,acceptRememberMe: ESSOContext.acceptRememberMe}));
    else
        throw new Error(ESSOConstants.flagsNotSet + n);
}
function authenticate(n, t, i, r, cb) {
    var f = ESSOConstants.essoFalse, u, e, o;
    if (n == ESSOConstants.essoUndefined && n == ESSOConstants.stringNull || t == ESSOConstants.essoUndefined && t == ESSOConstants.stringNull)
        return debug("UserName or Password can not be null/Empty"), ESSOConstants.essoFalse;

    return getCurrentSalt(n, function(salt) {
        u = hashPasswordByVersion(salt, t)
        e = [n, u, i];
        o = createAuthenticateRequest(e);
        jQuery.post(ESSOConstants.samlServiceUrl,{
            body: o,
            timeout: 5e5,
            dataType: ESSOConstants.dataType,
            headers: {
                SOAPAction: ESSOConstants.executeAuthnRequest,
                "Content-Type": ESSOConstants.contentType
            },
        }, function(n, t, u) {
            var o;
            // jQuery.removeCookie(ESSOConstants.samlToken, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain});
            // jQuery.removeCookie(ESSOConstants.rememberMeToken, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain});
            var embeddedResponse = libxml.parseXmlString(u).get('//wiz:ExecuteAuthnRequestResult', xmlNamespaces).text();
            var e = createXmlDocument(embeddedResponse);
                if (o = e.get("//samlp:StatusCode", xmlNamespaces).attr('Value').value(), o == "urn:oasis:names:tc:SAML:2.0:status:Success") {
                    if (!parseResponse(e, i))
                        return ESSOConstants.essoFalse;
                    ESSOContext.samlToken = samlTokenCookieObj;
                    r == !0 && saveTokensInCookies(samlTokenCookieObj, ESSOContext.rememberMeToken);
                    f = ESSOConstants.essoTrue
                } else {
                    debug("Login Failed for CurrentUser"), ESSOContext.rememberMeToken = samlResponseObj.RememberMeToken;
                }

            cb();
        });
    });
}
function parseResponse(n, t) {
    var f, e, i, r, u;
    try {
        samlTokenCookieObj.Id = n.root().attr("ID").value();
        samlTokenCookieObj.IssueInstant = n.root().attr("IssueInstant").value();
        samlTokenCookieObj.NotBefore = n.get('//saml:Conditions', xmlNamespaces).attr('NotBefore').value();
        samlTokenCookieObj.NotAfter = n.get('//saml:Conditions', xmlNamespaces).attr('NotOnOrAfter').value();
        samlTokenCookieObj.AuthnInstant = n.get('//saml:AuthnStatement', xmlNamespaces).attr('AuthnInstant').value();

        n.find("//saml:Attribute", xmlNamespaces).forEach(function(n) {
            var t = n.attr("Name").value();
            var attrVal = n.get("saml:AttributeValue", xmlNamespaces).text();
            t == "RememberMe" && (e = attrVal);
            t == "ScreenName" && (samlTokenCookieObj.ScreenName = attrVal);
            t == "SamlToken" && (samlTokenCookieObj.SAMLTokenValue = attrVal);
            t == "Permissions" && (f = attrVal)
        })

        samlTokenCookieObj.DigestValue = n.get('/samlp:Response/saml:Assertion[2]//sig:DigestValue', xmlNamespaces).text();
        samlTokenCookieObj.SignatureValue = n.get('/samlp:Response/saml:Assertion[2]//sig:SignatureValue', xmlNamespaces).text();
        samlTokenCookieObj.X509Certificate = n.get('/samlp:Response/saml:Assertion[2]//sig:X509Certificate', xmlNamespaces).text();

        if(f) {
            var strs = [];
            createXmlDocument(f).find("string").forEach(function(n) {
                strs.push(n.text());
            });
            samlTokenCookieObj.PermissionCodes = strs.join(',');
        }
    } catch (o) {
        return debug("Error in parsing the response"), ESSOConstants.essoFalse
    }
    // return t == !0 && (samlResponseObj.RememberMeToken = e, ESSOContext.acceptRememberMe = ESSOConstants.essoTrue, ESSOContext.rememberMeToken = samlResponseObj.RememberMeToken), ESSOConstants.essoTrue
    return true;
}
function authenticateByRememberMe(n) {
    var r, u, t, i, f, e;
    // try {
    //     if (r = null, u = null, r = "", t = jQuery.cookie(ESSOConstants.rememberMeToken), t != ESSOConstants.undefined && t != ESSOConstants.stringNull) {
    //         if (i = jQuery.deparam(t), i.RememberMeToken == ESSOConstants.essoUndefined && i.RememberMeToken == ESSOConstants.stringNull)
    //             return ESSOConstants.essoFalse;
    //         u = i.RememberMeToken
    //     } else
    //         return debug("RememberMeToken - Cookie Not Found"), ESSOConstants.essoFalse;
    //     f = r + "," + u;
    //     e = [f];
    //     jQuery.ajax({type: ESSOConstants.post,url: ESSOConstants.samlServiceUrl,data: createRememberMeTokenRequest(e),timeout: 5e5,contentType: ESSOConstants.contentType,dataType: ESSOConstants.dataType,headers: {SOAPAction: ESSOConstants.executeAuthnByRemembermeRequest},async: !1,ProcessData: !1,success: function(t, i, r) {
    //             var f;
    //             jQuery.removeCookie(ESSOConstants.samlToken, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain});
    //             jQuery.removeCookie(ESSOConstants.rememberMeToken, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain});
    //             var e = r.responseXML.documentElement.getElementsByTagName("AuthenticateByRememberMeResult"), o = e[0].textContent, u = createXmlDocument(o);
    //             return u.childNodes.length > 0 ? (f = jQuery(u).find("samlp\\:StatusCode, StatusCode").attr("Value"), f == "urn:oasis:names:tc:SAML:2.0:status:Success" ? parseResponse(u, !0) ? (ESSOContext.samlToken = samlTokenCookieObj, n == !0 && saveTokensInCookies(samlTokenCookieObj, ESSOContext.rememberMeToken), ESSOConstants.essoTrue) : ESSOConstants.essoFalse : (debug("Login Failed for CurrentUser"), ESSOContext.rememberMeToken = samlResponseObj.RememberMeToken, ESSOConstants.essoFalse)) : (debug("Authenticate By RememberMe has failed"), ESSOConstants.essoFalse)
    //         },error: function(n, t, i) {
    //             throw jQuery.error(n.responseText + t + i);
    //         }})
    // } catch (o) {
    //     return ESSOConstants.essoFalse
    // }
    return ESSOConstants.essoTrue
}
// function reloadSession() {
//     var n, t, i;
//     try {
//         if (n = jQuery.cookie(ESSOConstants.samlToken), n != ESSOConstants.undefined && n != ESSOConstants.stringNull)
//             return t = jQuery.deparam(n), i = [t.SAMLTokenValue], jQuery.ajax({type: ESSOConstants.post,url: ESSOConstants.samlServiceUrl,data: createReloadSessionRequest(i),timeout: 5e5,contentType: ESSOConstants.contentType,dataType: ESSOConstants.dataType,headers: {SOAPAction: ESSOConstants.executReloadSessionRequest},async: !1,ProcessData: !1,success: function(n, i, r) {
//                     var f;
//                     jQuery.removeCookie(ESSOConstants.samlToken, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain});
//                     jQuery.removeCookie(ESSOConstants.rememberMeToken, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain});
//                     var e = r.responseXML.documentElement.getElementsByTagName("ReloadSessionResult"), o = e[0].textContent, u = createXmlDocument(o);
//                     return u.childNodes.length > 0 ? (f = jQuery(u).find("samlp\\:StatusCode, StatusCode").attr("Value"), f == "urn:oasis:names:tc:SAML:2.0:status:Success" && !parseResponse(u, ESSOConstants.essoFalse)) ? ESSOConstants.essoFalse : (ESSOContext.samlToken = t, jQuery.cookie(ESSOConstants.samlToken, jQuery.param(t), {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain}), ESSOConstants.essoTrue) : (debug("Reload Session has Failed"), ESSOConstants.essoFalse)
//                 },error: function(n, t, i) {
//                     throw jQuery.error(n.responseText + t + i);
//                 }}), ESSOConstants.essoTrue;
//         debug("Cookie Not Found")
//     } catch (r) {
//         return ESSOConstants.essoFalse
//     }
// }
function saveTokensInCookies(n, t) {
    // if (debug("saveTokensInCookies start: ESSOContext.acceptRememberMe = " + ESSOContext.acceptRememberMe), jQuery.removeCookie(ESSOConstants.samlToken, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain}), jQuery.removeCookie(ESSOConstants.rememberMeToken, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain}), n != "" && n != ESSOContext.essoUndefined ? (jQuery.cookie(ESSOConstants.samlToken, jQuery.param(n), {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain}), samlTokenCookieObj = n, ESSOContext.samlToken = samlTokenCookieObj, ESSOContext.isAuthenticated = ESSOConstants.essoTrue, debug("SAMLToken is set in cookie")) : debug("Cookie Not Found For SAML Token"), ESSOContext.acceptRememberMe == ESSOConstants.essoTrue && t != ESSOConstants.essoUndefined && t != "" && t != ESSOConstants.stringNull) {
    //     ESSOContext.rememberMeToken = t;
    //     var i = {RememberMeToken: t};
    //     jQuery.cookie(ESSOConstants.rememberMeToken, jQuery.param(i), {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain,expires: ESSOConfig.expiryDays});
    //     debug("RememberMeToken is set in cookie")
    // } else
    //     debug("Cookie Not Found For RememberMe Token")
}
function hasPermission(n) {
    var i = jQuery.cookie(ESSOConstants.samlToken), r = "false", t;
    if (i != ESSOConstants.undefined && i != ESSOConstants.stringNull) {
        var f = jQuery.deparam(i), e = [f.PermissionCodes], u = e[0].split(",");
        for (t = 0; t < u.length; t++)
            n == u[t] && (r = ESSOConstants.essoTrue)
    }
    return r
}
function hashPassword(n, t) {
    return CryptoJS.SHA256(t + n)
}
// function dropSession() {
//     var n, t, i;
//     try {
//         samlTokenCookieObj = makeNullSamlTokenCookieObj;
//         ESSOContext.isAuthenticated = ESSOConstants.essoFalse;
//         ESSOContext.acceptRememberMe = ESSOConstants.essoFalse;
//         n = jQuery.cookie(ESSOConstants.samlToken);
//         jQuery.removeCookie(ESSOConstants.samlToken, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain});
//         jQuery.removeCookie(ESSOConstants.rememberMeToken, {path: ESSOConstants.cookiePath,domain: ESSOConstants.cookieDomain});
//         n != ESSOConstants.undefined && n != ESSOConstants.stringNull ? (t = jQuery.deparam(n), i = [t.SAMLTokenValue], jQuery.ajax({type: ESSOConstants.post,url: ESSOConstants.samlServiceUrl,data: createDropSessionRequest(i),timeout: 5e5,contentType: ESSOConstants.contentType,dataType: ESSOConstants.dataType,headers: {SOAPAction: ESSOConstants.executeLogoutRequest},async: !1,ProcessData: !1,success: onLogoutRequestWithSAMLSuccess,error: function(n, t, i) {
//                 throw jQuery.error(n.responseText + t + i);
//             }})) : debug("Cookie Not Found")
//     } catch (r) {
//         return ESSOConstants.essoFalse
//     }
// }
function createRememberMeTokenRequest(n) {
    return '<s:Envelope xmlns:s="' + ESSOConstants.envNameSpace + '"><s:Body><AuthenticateByRememberMe  xmlns="' + ESSOConstants.authNameSpace + '"><requestMessage xmlns:i="' + ESSOConstants.xmlSchemaNameSpace + '">&lt;samlp:AttributeQuery xmlns:samlp = "urn:oasis:names:tc:SAML:2.0:protocol" ID="' + guid() + '" IssueInstant="' + getUTCDateTime() + '" Version="2.0"&gt;&lt;samlp:Issuer xmlns:samlp ="urn:oasis:names:tc:SAML:2.0:assertion"/&gt;&lt;saml:Subject xmlns:saml = "urn:oasis:names:tc:SAML:2.0:assertion"&gt;&lt;saml:NameID&gt; ' + n[0] + ' &lt;/saml:NameID&gt;&lt;/saml:Subject&gt; &lt;saml:Attribute xmlns:saml = "urn:oasis:names:tc:SAML:2.0:assertion" Name = "SamlToken"/&gt;&lt;/samlp:AttributeQuery&gt;<\/requestMessage><\/AuthenticateByRememberMe><\/s:Body><\/s:Envelope>'
}
function createAuthenticateRequest(n) {
    return '<?xml version="1.0" encoding="utf-8"?><s:Envelope xmlns:s="' + ESSOConstants.envNameSpace + '" xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"><s:Body><ExecuteAuthnRequest xmlns="' + ESSOConstants.authNameSpace + '"><requestMessage xmlns:i="' + ESSOConstants.xmlSchemaNameSpace + '">&lt;samlp:AuthnRequest  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="' + guid() + '" Version="2.0" IssueInstant="' + getUTCDateTime() + '" xmlns="urn:oasis:names:tc:SAML:2.0:protocol"&gt;&lt;saml:Issuer AllowCreate="false" SPNameQualifier="' + ESSOConstants.cookieDomain + '" Format="urn:oasis:names:tc:SAML:2.0:nameidformat:entity" xmlns="urn:oasis:names:tc:SAML:2.0:assertion"/&gt;&lt;samlp:Extensions&gt;&lt;Credentials UserName="' + n[0] + '" Password="' + n[1] + '" RememberMe="' + n[2] + '"   xmlns="##other" /&gt;&lt;/samlp:Extensions&gt;&lt;/samlp:AuthnRequest&gt;<\/requestMessage><\/ExecuteAuthnRequest><\/s:Body><\/s:Envelope>'
}
function createReloadSessionRequest(n) {
    return '<s:Envelope xmlns:s="' + ESSOConstants.envNameSpace + '"><s:Body><ReloadSession  xmlns="' + ESSOConstants.authNameSpace + '"><requestMessage xmlns:i="' + ESSOConstants.xmlSchemaNameSpace + '">&lt;samlp:AttributeQuery xmlns:samlp = "urn:oasis:names:tc:SAML:2.0:protocol" ID="' + guid() + '" IssueInstant="' + getUTCDateTime() + '" Version="2.0"&gt;&lt;samlp:Issuer xmlns:samlp ="urn:oasis:names:tc:SAML:2.0:assertion"/&gt;&lt;saml:Subject xmlns:saml = "urn:oasis:names:tc:SAML:2.0:assertion"&gt;&lt;saml:NameID&gt; ' + n + ' &lt;/saml:NameID&gt;&lt;/saml:Subject&gt; &lt;saml:Attribute xmlns:saml = "urn:oasis:names:tc:SAML:2.0:assertion" Name = "SamlToken"/&gt;&lt;/samlp:AttributeQuery&gt;<\/requestMessage><\/ReloadSession><\/s:Body><\/s:Envelope>'
}
function createDropSessionRequest(n) {
    return '<s:Envelope xmlns:s="' + ESSOConstants.envNameSpace + '"><s:Body><ExecuteLogoutRequest xmlns="' + ESSOConstants.authNameSpace + '"><requestMessage xmlns:i="' + ESSOConstants.xmlSchemaNameSpace + '">&lt;samlp:LogoutRequest  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="' + guid() + '" Version="2.0" IssueInstant="' + getUTCDateTime() + '" Destination= "http://www.example.com/" Reason="urn:oasis:names:tc:SAML:2.0:logout:user" xmlns="urn:oasis:names:tc:SAML:2.0:protocol"&gt;&lt;saml:Issuer AllowCreate="true" SPNameQualifier="' + ESSOConstants.cookieDomain + '" Format="urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress" xmlns="urn:oasis:names:tc:SAML:2.0:assertion"&gt;&lt;/saml:Issuer&gt;&lt;samlp:SessionIndex&gt;' + n + "&lt;/samlp:SessionIndex&gt;&lt;/samlp:LogoutRequest&gt;<\/requestMessage><\/ExecuteLogoutRequest><\/s:Body><\/s:Envelope>"
}
function createIdentityVersionRequest(n) {
    return '<s:Envelope xmlns:s="' + ESSOConstants.envNameSpace + '"><s:Body><GetIdentityVersion  xmlns="' + ESSOConstants.authNameSpace + '"><requestMessage xmlns:i="' + ESSOConstants.xmlSchemaNameSpace + '">&lt;samlp:AttributeQuery xmlns:samlp = "urn:oasis:names:tc:SAML:2.0:protocol" ID="' + guid() + '" IssueInstant="' + getUTCDateTime() + '" Version="2.0"&gt;&lt;samlp:Issuer xmlns:samlp ="urn:oasis:names:tc:SAML:2.0:assertion"/&gt;&lt;saml:Subject xmlns:saml = "urn:oasis:names:tc:SAML:2.0:assertion"&gt;&lt;saml:NameID&gt; ' + n + ' &lt;/saml:NameID&gt;&lt;/saml:Subject&gt; &lt;saml:Attribute xmlns:saml = "urn:oasis:names:tc:SAML:2.0:assertion" Name = "UserName"/&gt;&lt;/samlp:AttributeQuery&gt;<\/requestMessage><\/GetIdentityVersion><\/s:Body><\/s:Envelope>'
}
function onLogoutRequestWithSAMLSuccess(n, t, i) {
    try {
        var r = i.responseXML.documentElement.getElementsByTagName("ExecuteLogoutRequestResult"), u = r[0].textContent, f = createXmlDocument(u), e = $(f).find("samlp\\:StatusCode, StatusCode").attr("Value");
        e == "urn:oasis:names:tc:SAML:2.0:status:Success" ? debug("Logout for current session was Successful") : debug("Logout for current session Failed")
    } catch (o) {
        debug("Issue found while parsing the response")
    }
}
function createXmlDocument(n) {
    return libxml.parseXmlString(n);
}
function s4() {
    return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1)
}
function guid() {
    return "_" + s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4()
}
function pad(n) {
    return n < 10 ? "0" + n : n
}
function getUTCDateTime() {
    var n = new Date, f = n.getUTCDate(), t, i, r, u;
    return f = pad(f), t = n.getUTCMonth() + 1, t = pad(t), i = n.getUTCHours(), i = pad(i), r = n.getUTCMinutes(), r = pad(r), u = n.getUTCSeconds(), u = pad(u), n.getUTCFullYear() + "-" + t + "-" + f + "T" + i + ":" + r + ":" + u + "Z"
}
function hashPasswordByVersion(n, t) {
    var r = ESSOConstants.stringNull, i, u;
    if (getIdentityVersionObj.ProviderCode != ESSOConstants.stringNull && getIdentityVersionObj.ProviderCode != ESSOConstants.essoUndefined)
        switch (getIdentityVersionObj.ProviderCode) {
            case "0":
                r = CryptoJS.MD5(t);
                break;
            case "1":
                i = base64_decode(getIdentityVersionObj.DynamicSalt);
                i.reverse();
                i.pop();
                i.pop();
                i.reverse();
                var f = base64EncArr(i), e = CryptoJS.enc.Base64.parse(f), o = CryptoJS.enc.Utf8.parse(t), s = o.concat(e), h = CryptoJS.SHA1(s);
                r = CryptoJS.enc.Base64.stringify(h);
                u = base64_decode(r);
                u = u.concat(i);
                r = base64EncArr(u);
                break;
            case "2":
                r = CryptoJS.SHA256(t + n)
        }
    return r
}
function base64EncArr(n) {
    for (var i = 2, u = "", f = n.length, r = 0, t = 0; t < f; t++)
        i = t % 3, t > 0 && t * 4 / 3 % 76 == 0 && (u += "\r\n"), r |= n[t] << (16 >>> i & 24), (i === 2 || n.length - t == 1) && (u += String.fromCharCode(uint6ToB64(r >>> 18 & 63), uint6ToB64(r >>> 12 & 63), uint6ToB64(r >>> 6 & 63), uint6ToB64(r & 63)), r = 0);
    return u.substr(0, u.length - 2 + i) + (i === 2 ? "" : i === 1 ? "=" : "==")
}
function uint6ToB64(n) {
    return n < 26 ? n + 65 : n < 52 ? n + 71 : n < 62 ? n - 4 : n === 62 ? 43 : n === 63 ? 47 : 65
}
function UTF8ArrToStr(n) {
    for (var u = "", i, r = n.length, t = 0; t < r; t++)
        i = n[t], u += String.fromCharCode(i > 251 && i < 254 && t + 5 < r ? (i - 252) * 1073741824 + (n[++t] - 128 << 24) + (n[++t] - 128 << 18) + (n[++t] - 128 << 12) + (n[++t] - 128 << 6) + n[++t] - 128 : i > 247 && i < 252 && t + 4 < r ? (i - 248 << 24) + (n[++t] - 128 << 18) + (n[++t] - 128 << 12) + (n[++t] - 128 << 6) + n[++t] - 128 : i > 239 && i < 248 && t + 3 < r ? (i - 240 << 18) + (n[++t] - 128 << 12) + (n[++t] - 128 << 6) + n[++t] - 128 : i > 223 && i < 240 && t + 2 < r ? (i - 224 << 12) + (n[++t] - 128 << 6) + n[++t] - 128 : i > 191 && i < 224 && t + 1 < r ? (i - 192 << 6) + n[++t] - 128 : i);
    return u
}
function base64_decode(n) {
    var o = n.length, s = Math.floor(o / 4), r, h, l, e, i;
    if (4 * s != o)
        throw "String length must be a multiple of four.";
    r = 0;
    o != 0 && (n.charAt(o - 1) == "=" && (r++, s--), n.charAt(o - 2) == "=" && r++);
    h = 3 * s - r;
    h < 0 && (h = 0);
    var u = new Array(h), t = 0, f = 0;
    for (l = 0; l < s; l++) {
        var e = get_a2i(n.charCodeAt(t++)), i = get_a2i(n.charCodeAt(t++)), c = get_a2i(n.charCodeAt(t++)), a = get_a2i(n.charCodeAt(t++));
        u[f++] = 255 & (e << 2 | i >> 4);
        u[f++] = 255 & (i << 4 | c >> 2);
        u[f++] = 255 & (c << 6 | a)
    }
    if (r != 0)
        if (r == 1) {
            var e = get_a2i(n.charCodeAt(t++)), i = get_a2i(n.charCodeAt(t++)), c = get_a2i(n.charCodeAt(t++));
            u[f++] = 255 & (e << 2 | i >> 4);
            u[f++] = 255 & (i << 4 | c >> 2)
        } else if (r == 2)
            e = get_a2i(n.charCodeAt(t++)), i = get_a2i(n.charCodeAt(t++)), u[f++] = 255 & (e << 2 | i >> 4);
        else
            throw "decode error";
    return u
}
function get_a2i(n) {
    var t = 0 <= n && n < a2i.length ? a2i[n] : -1;
    if (t < 0)
        throw "Illegal character " + n;
    return t
}
function getIdentityVersion(n, cb) {
    var t = [n];
    jQuery.post(ESSOConstants.samlServiceUrl, {
        body: createIdentityVersionRequest(t),
        timeout: 5e5,
        dataType: ESSOConstants.dataType,
        headers: {
            SOAPAction: ESSOConstants.executIdentityVersionRequest,
            "Content-Type": ESSOConstants.contentType
        }
    }, function(t, i, r) {
        var embeddedResponse = libxml.parseXmlString(r).get('//wiz:GetIdentityVersionResult', xmlNamespaces).text();
        var u = createXmlDocument(embeddedResponse);
        u.find("saml:Attribute", xmlNamespaces).forEach(function(n) {
            var t = n.attr('Name').value();
            var attrVal = n.get("saml:AttributeValue", xmlNamespaces).text();
            t == "Salt" && (getIdentityVersionObj.DynamicSalt = attrVal);
            t == "ClientSalt" && (getIdentityVersionObj.ClientSalt = attrVal);
            t == "ProviderCode" && (getIdentityVersionObj.ProviderCode = attrVal);
        })

        cb();
    });
}
function constructSamlToken() {
    for (var o = jQuery.cookie(ESSOConstants.samlToken), n = jQuery.deparam(o), s = [n.SAMLTokenValue], r = [n.ScreenName], h = [n.IssueInstant], c = [n.AuthnInstant], l = [n.NotAfter], u = [n.Id], a = [n.PermissionCodes], v = [n.NotBefore], y = [n.DigestValue], p = [n.X509Certificate], w = [n.SignatureValue], t = '<saml:Assertion Version="2.0" ID="' + u + '" IssueInstant="' + h + '" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><saml:Issuer AllowCreate="false">IdP<\/saml:Issuer><saml:Subject><saml:NameID AllowCreate="false" NameQualifier="Wizards">SamlAdapter<\/saml:NameID><saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"><saml:SubjectConfirmationData /><\/saml:SubjectConfirmation><\/saml:Subject><saml:Conditions NotBefore="' + v + ' NotOnOrAfter="' + l + '"><saml:AudienceRestriction><saml:Audience>' + r + '<\/saml:Audience><\/saml:AudienceRestriction><\/saml:Conditions><saml:AuthnStatement AuthnInstant="' + c + '"><saml:AuthnContext><saml:AuthnContextClassRef>saml:AuthnContextClassRef<\/saml:AuthnContextClassRef><\/saml:AuthnContext><\/saml:AuthnStatement><saml:AttributeStatement><saml:Attribute Name="SamlToken" NameFormat="urn:oasis:names:tc:SAML:2.0:nameidformat:entity"><saml:AttributeValue xsi:type="xsd:string">' + s + '<\/saml:AttributeValue><\/saml:Attribute><saml:Attribute Name="ScreenName" NameFormat="urn:oasis:names:tc:SAML:2.0:nameidformat:entity"><saml:AttributeValue xsi:type="xsd:string">' + r + '<\/saml:AttributeValue><\/saml:Attribute><saml:Attribute Name="Permissions" NameFormat="urn:oasis:names:tc:SAML:2.0:nameidformat:entity"><saml:AttributeValue xsi:type="xsd:string">&lt;ArrayOfString xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"&gt;', f = a.toString().split(","), b = f.length, i = 0, e; i < b; )
        t = t + "&lt;string&gt;" + f[i] + "&lt;/string&gt;&lt;/ArrayOfString&gt;", i++;
    return e = '<\/saml:AttributeValue><\/saml:Attribute><\/saml:AttributeStatement><Signature xmlns="http://www.w3.org/2000/09/xmldsig#"><SignedInfo><CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#WithComments" /><SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1" /><Reference URI="#' + u + '"><DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" /><DigestValue>' + y + "<\/DigestValue><\/Reference><\/SignedInfo><SignatureValue>" + w + "<\/SignatureValue><KeyInfo><X509Data><X509Certificate>" + p + "<\/X509Certificate><\/X509Data><\/KeyInfo><\/Signature><\/saml:Assertion>", t + e
}
function getRandomSalt() {
    var n = CryptoJS.lib.WordArray.random(16);
    return n.toString(CryptoJS.enc.Base64)
}
function getCurrentSalt(n, cb) {
    return getIdentityVersion(n, function() {
        cb(getIdentityVersionObj.ClientSalt != ESSOConstants.stringNull ? getIdentityVersionObj.ClientSalt : ESSOConstants.stringNull);
    });
}
var ESSOConfig, ESSOContext, ESSOConstants, URL, flagValue, flagsSet, currentDomain, previousDomain, providerVersion, flags, SingletonloadConfiguration, loadResult, authenticateEntity, a2i, CryptoJS;
ESSOConfig = new ESSOConfig;
ESSOConfig.expiryDays = 30;
ESSOConfig.timeOut = 6e4;
ESSOContext = new ESSOContext;
ESSOContext.maintainSession = "";
ESSOContext.acceptRememberMe = "";
ESSOContext.reqReAuthentication = "";
ESSOContext.isAuthenticated = "false";
ESSOContext.samlToken = "";
ESSOContext.rememberMeToken = "";
ESSOContext.saveToken = ESSOConstants.essoFalse;
ESSOConstants = new ESSOConstants;
ESSOConstants.cookieDomain = "accounts.wizards.com";
ESSOConstants.cookieDomain === "@SamlCookieDomain@" && (ESSOConstants.cookieDomain = null);
ESSOConstants.samlServiceUrl = "https://accounts.wizards.com/Orchestration/Esso/Saml";
ESSOConstants.samlServiceUrl === "@SamlServiceUrl@" && (ESSOConstants.samlServiceUrl = "/Saml/SamlEndpoint.svc");
ESSOConstants.flagsAvailable = "true";
ESSOConstants.setTrue = "1";
ESSOConstants.setFalse = "0";
ESSOConstants.setMaintainSession = "1";
ESSOConstants.reqReAuthentication = "1";
ESSOConstants.essoTrue = "true";
ESSOConstants.essoFalse = "false";
ESSOConstants.samlToken = "SAMLToken";
ESSOConstants.rememberMeToken = "RememberMeToken";
ESSOConstants.stringNull = "null";
ESSOConstants.essoUndefined = undefined;
ESSOConstants.flagsSet = "flagsSet";
ESSOConstants.authenticatError = "authenticate_error";
ESSOConstants.providerCode = "providerCode";
ESSOConstants.getIdentityVersionError = "getIdentityVersion_error";
ESSOConstants.getSessionError = "getSession_error";
ESSOConstants.isSessionValidError = "Error in isSessionValid method";
ESSOConstants.sessionId = "SessionId";
ESSOConstants.equals = "=";
ESSOConstants.authenticateErrorText = "Error in Authenticate method :";
ESSOConstants.dropSessionErrorText = "Error in DropSession method :";
ESSOConstants.getSessionErrorText = "Error in GetSession method :";
ESSOConstants.authByRemMeErrorText = "Error in AuthenticateByRememberMe method :";
ESSOConstants.cookiePath = "/";
ESSOConstants.hasPermissionError = "permission_error";
ESSOConstants.serviceUrl = "http://" + ESSOConfig.environment + "/Business/Esso";
ESSOConstants.envNameSpace = "http://schemas.xmlsoap.org/soap/envelope/";
ESSOConstants.authNameSpace = "http://www.wizards.com/Service/2013-03";
ESSOConstants.xmlSchemaNameSpace = "http://www.w3.org/2001/XMLSchema-instance";
ESSOConstants.executeAuthnRequest = "http://www.wizards.com/Service/2013-03/ISamlEndpoint/ExecuteAuthnRequest";
ESSOConstants.executeLogoutRequest = "http://www.wizards.com/Service/2013-03/ISamlEndpoint/ExecuteLogoutRequest";
ESSOConstants.executeAuthnByRemembermeRequest = "http://www.wizards.com/Service/2013-03/ISamlEndpoint/AuthenticateByRememberMe";
ESSOConstants.executReloadSessionRequest = "http://www.wizards.com/Service/2013-03/ISamlEndpoint/ReloadSession";
ESSOConstants.executIdentityVersionRequest = "http://www.wizards.com/Service/2013-03/ISamlEndpoint/GetIdentityVersion";
ESSOConstants.createRequest = "CreateRequest";
ESSOConstants.SAMLContract = 'http://schemas.datacontract.org/2004/07/Wizards.Service.Business.Esso.ServiceLayer.Saml2Entities"';
ESSOConstants.tagcontract = "ResponseForAuthnRequest";
ESSOConstants.tagrequestMessage = "requestMessage";
ESSOConstants.tagTransactionId = "TransactionId";
ESSOConstants.tagIssueInstant = "IssueInstant";
ESSOConstants.tagIssuer = "Issuer";
ESSOConstants.tagrequestMessage = "ResponseForAuthnRequest";
ESSOConstants.contentType = "text/xml;charset=utf-8";
ESSOConstants.dataType = "xml";
ESSOConstants.soapAction = "SOAPAction";
ESSOConstants.post = "POST";
ESSOConstants.appXml = "application/xml";
ESSOConstants.microsoftDom = "Microsoft.XMLDOM";
ESSOConstants.authenticatWithSAMLError = "authenticate_error";
ESSOConstants.dropSessionWithSAMLError = "dropSessionError_error";
ESSOConstants.jsonFlag = "flags.json";
ESSOConstants.json = "json";
ESSOConstants.appJson = "application/json";
flags = ESSOConstants.emptyString;
SingletonloadConfiguration = function() {
    function t() {
        return new loadFlagConfiguration
    }
    var n;
    return {getInstance: function() {
            return n || (n = t()), n
        }}
}();
loadconfiguration = {};
loadconfiguration.loadpolicyvariables = policyvariables;
loadconfiguration.loadSite = loadWidget;
loadconfiguration.load = loadDomainSettings;
loadResult = ESSOConstants.essoTrue;
jQuery.deparam = function(n) {
    var i = {}, r, t, u;
    if (!n)
        return i;
    for (r = n.split("&"), t = 0; t < r.length; t++)
        u = r[t].split("="), i[decodeURIComponent(u[0])] = decodeURIComponent(u[1]);
    return i
};
var samlTokenPublicfieldsObj = {ScreenName: ESSOConstants.stringNull,Permissioncode: ESSOConstants.stringNull}, samlResponseObj = {SamlToken: ESSOConstants.stringNull,RememberMeToken: ESSOConstants.stringNull,SamlTokenAttributeValues: samlTokenPublicfieldsObj}, samlTokenCookieObj = {SAMLTokenValue: ESSOConstants.stringNull,ScreenName: ESSOConstants.stringNull,PermissionCodes: ESSOConstants.stringNull,Id: ESSOConstants.stringNull,IssueInstant: ESSOConstants.stringNull,NotBefore: ESSOConstants.stringNull,NotAfter: ESSOConstants.stringNull,AuthnInstant: ESSOConstants.stringNull,DigestValue: ESSOConstants.stringNull,SignatureValue: ESSOConstants.stringNull,X509Certificate: ESSOConstants.stringNull}, makeNullSamlTokenCookieObj = {SAMLTokenValue: ESSOConstants.stringNull,ScreenName: ESSOConstants.stringNull,PermissionCodes: ESSOConstants.stringNull,Id: ESSOConstants.stringNull,IssueInstant: ESSOConstants.stringNull,NotBefore: ESSOConstants.stringNull,NotAfter: ESSOConstants.stringNull,AuthnInstant: ESSOConstants.stringNull,DigestValue: ESSOConstants.stringNull,SignatureValue: ESSOConstants.stringNull,X509Certificate: ESSOConstants.stringNull}, getIdentityVersionObj = {ProviderCode: ESSOConstants.stringNull,DynamicSalt: ESSOConstants.stringNull,ClientSalt: ESSOConstants.stringNull};
authenticateEntity = function() {
    return {getSAMLToken: function() {
            return ESSOContext.samlToken
        },getIsAuthenticated: function() {
            return ESSOContext.isAuthenticated
        },getRememberMeToken: function() {
            return ESSOContext.rememberMeToken
        }}
}();
a2i = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51], function(n) {
    typeof define == "function" && define.amd ? define(["jquery"], n) : n(jQuery)
}(function(n) {
    function i(n) {
        return t.raw ? n : encodeURIComponent(n)
    }
    function f(n) {
        return t.raw ? n : decodeURIComponent(n)
    }
    function e(n) {
        return i(t.json ? JSON.stringify(n) : String(n))
    }
    function o(n) {
        n.indexOf('"') === 0 && (n = n.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
        try {
            n = decodeURIComponent(n.replace(u, " "))
        } catch (i) {
            return
        }
        try {
            return t.json ? JSON.parse(n) : n
        } catch (i) {
        }
    }
    function r(i, r) {
        var u = t.raw ? i : o(i);
        return n.isFunction(r) ? r(u) : u
    }
    var u = /\+/g, t = n.cookie = function(u, o, s) {
        var y, a, h, v, c, p;
        if (o !== undefined && !n.isFunction(o))
            return s = n.extend({}, t.defaults, s), typeof s.expires == "number" && (y = s.expires, a = s.expires = new Date, a.setDate(a.getDate() + y)), document.cookie = [i(u), "=", e(o), s.expires ? "; expires=" + s.expires.toUTCString() : "", s.path ? "; path=" + s.path : "", s.domain ? "; domain=" + s.domain : "", s.secure ? "; secure" : ""].join("");
        for (h = u ? undefined : {}, v = document.cookie ? document.cookie.split("; ") : [], c = 0, p = v.length; c < p; c++) {
            var w = v[c].split("="), b = f(w.shift()), l = w.join("=");
            if (u && u === b) {
                h = r(l, o);
                break
            }
            u || (l = r(l)) === undefined || (h[b] = l)
        }
        return h
    };
    t.defaults = {};
    n.removeCookie = function(t, i) {
        return n.cookie(t) !== undefined ? (n.cookie(t, "", n.extend({}, i, {expires: -1})), !0) : !1
    }
});
CryptoJS = CryptoJS || function(n, t) {
    var u = {}, f = u.lib = {}, i = f.Base = function() {
        function n() {
        }
        return {extend: function(t) {
                n.prototype = this;
                var i = new n;
                return t && i.mixIn(t), i.hasOwnProperty("init") || (i.init = function() {
                    i.$super.init.apply(this, arguments)
                }), i.init.prototype = i, i.$super = this, i
            },create: function() {
                var n = this.extend();
                return n.init.apply(n, arguments), n
            },init: function() {
            },mixIn: function(n) {
                for (var t in n)
                    n.hasOwnProperty(t) && (this[t] = n[t]);
                n.hasOwnProperty("toString") && (this.toString = n.toString)
            },clone: function() {
                return this.init.prototype.extend(this)
            }}
    }(), r = f.WordArray = i.extend({init: function(n, i) {
            n = this.words = n || [];
            this.sigBytes = i != t ? i : n.length * 4
        },toString: function(n) {
            return (n || h).stringify(this)
        },concat: function(n) {
            var i = this.words, r = n.words, u = this.sigBytes, f = n.sigBytes, e, t;
            if (this.clamp(), u % 4)
                for (t = 0; t < f; t++)
                    e = r[t >>> 2] >>> 24 - t % 4 * 8 & 255, i[u + t >>> 2] |= e << 24 - (u + t) % 4 * 8;
            else if (r.length > 65535)
                for (t = 0; t < f; t += 4)
                    i[u + t >>> 2] = r[t >>> 2];
            else
                i.push.apply(i, r);
            return this.sigBytes += f, this
        },clamp: function() {
            var i = this.words, t = this.sigBytes;
            i[t >>> 2] &= 4294967295 << 32 - t % 4 * 8;
            i.length = n.ceil(t / 4)
        },clone: function() {
            var n = i.clone.call(this);
            return n.words = this.words.slice(0), n
        },random: function(t) {
            for (var u = [], i = 0; i < t; i += 4)
                u.push(n.random() * 4294967296 | 0);
            return new r.init(u, t)
        }}), e = u.enc = {}, h = e.Hex = {stringify: function(n) {
            for (var u = n.words, f = n.sigBytes, i = [], r, t = 0; t < f; t++)
                r = u[t >>> 2] >>> 24 - t % 4 * 8 & 255, i.push((r >>> 4).toString(16)), i.push((r & 15).toString(16));
            return i.join("")
        },parse: function(n) {
            for (var i = n.length, u = [], t = 0; t < i; t += 2)
                u[t >>> 3] |= parseInt(n.substr(t, 2), 16) << 24 - t % 8 * 4;
            return new r.init(u, i / 2)
        }}, o = e.Latin1 = {stringify: function(n) {
            for (var u = n.words, f = n.sigBytes, i = [], r, t = 0; t < f; t++)
                r = u[t >>> 2] >>> 24 - t % 4 * 8 & 255, i.push(String.fromCharCode(r));
            return i.join("")
        },parse: function(n) {
            for (var i = n.length, u = [], t = 0; t < i; t++)
                u[t >>> 2] |= (n.charCodeAt(t) & 255) << 24 - t % 4 * 8;
            return new r.init(u, i)
        }}, c = e.Utf8 = {stringify: function(n) {
            try {
                return decodeURIComponent(escape(o.stringify(n)))
            } catch (t) {
                throw new Error("Malformed UTF-8 data");
            }
        },parse: function(n) {
            return o.parse(unescape(encodeURIComponent(n)))
        }}, s = f.BufferedBlockAlgorithm = i.extend({reset: function() {
            this._data = new r.init;
            this._nDataBytes = 0
        },_append: function(n) {
            typeof n == "string" && (n = c.parse(n));
            this._data.concat(n);
            this._nDataBytes += n.sigBytes
        },_process: function(t) {
            var e = this._data, h = e.words, c = e.sigBytes, o = this.blockSize, a = o * 4, u = c / a, i, s, f, l;
            if (u = t ? n.ceil(u) : n.max((u | 0) - this._minBufferSize, 0), i = u * o, s = n.min(i * 4, c), i) {
                for (f = 0; f < i; f += o)
                    this._doProcessBlock(h, f);
                l = h.splice(0, i);
                e.sigBytes -= s
            }
            return new r.init(l, s)
        },clone: function() {
            var n = i.clone.call(this);
            return n._data = this._data.clone(), n
        },_minBufferSize: 0}), a = f.Hasher = s.extend({cfg: i.extend(),init: function(n) {
            this.cfg = this.cfg.extend(n);
            this.reset()
        },reset: function() {
            s.reset.call(this);
            this._doReset()
        },update: function(n) {
            return this._append(n), this._process(), this
        },finalize: function(n) {
            n && this._append(n);
            return this._doFinalize()
        },blockSize: 16,_createHelper: function(n) {
            return function(t, i) {
                return new n.init(i).finalize(t)
            }
        },_createHmacHelper: function(n) {
            return function(t, i) {
                return new l.HMAC.init(n, i).finalize(t)
            }
        }}), l = u.algo = {};
    return u
}(Math), function() {
    var t = CryptoJS, r = t.lib, f = r.WordArray, i = r.Hasher, e = t.algo, n = [], u = e.SHA1 = i.extend({_doReset: function() {
            this._hash = new f.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520])
        },_doProcessBlock: function(t, i) {
            for (var r = this._hash.words, s = r[0], f = r[1], e = r[2], o = r[3], h = r[4], c, l, u = 0; u < 80; u++)
                u < 16 ? n[u] = t[i + u] | 0 : (c = n[u - 3] ^ n[u - 8] ^ n[u - 14] ^ n[u - 16], n[u] = c << 1 | c >>> 31), l = (s << 5 | s >>> 27) + h + n[u], l += u < 20 ? (f & e | ~f & o) + 1518500249 : u < 40 ? (f ^ e ^ o) + 1859775393 : u < 60 ? (f & e | f & o | e & o) - 1894007588 : (f ^ e ^ o) - 899497514, h = o, o = e, e = f << 30 | f >>> 2, f = s, s = l;
            r[0] = r[0] + s | 0;
            r[1] = r[1] + f | 0;
            r[2] = r[2] + e | 0;
            r[3] = r[3] + o | 0;
            r[4] = r[4] + h | 0
        },_doFinalize: function() {
            var i = this._data, n = i.words, r = this._nDataBytes * 8, t = i.sigBytes * 8;
            return n[t >>> 5] |= 128 << 24 - t % 32, n[(t + 64 >>> 9 << 4) + 14] = Math.floor(r / 4294967296), n[(t + 64 >>> 9 << 4) + 15] = r, i.sigBytes = n.length * 4, this._process(), this._hash
        },clone: function() {
            var n = i.clone.call(this);
            return n._hash = this._hash.clone(), n
        }});
    t.SHA1 = i._createHelper(u);
    t.HmacSHA1 = i._createHmacHelper(u)
}(), function(n) {
    function i(n, t, i, r, u, f, e) {
        var o = n + (t & i | ~t & r) + u + e;
        return (o << f | o >>> 32 - f) + t
    }
    function r(n, t, i, r, u, f, e) {
        var o = n + (t & r | i & ~r) + u + e;
        return (o << f | o >>> 32 - f) + t
    }
    function u(n, t, i, r, u, f, e) {
        var o = n + (t ^ i ^ r) + u + e;
        return (o << f | o >>> 32 - f) + t
    }
    function f(n, t, i, r, u, f, e) {
        var o = n + (i ^ (t | ~r)) + u + e;
        return (o << f | o >>> 32 - f) + t
    }
    var e = CryptoJS, h = e.lib, c = h.WordArray, o = h.Hasher, l = e.algo, t = [], s;
    (function() {
        for (var i = 0; i < 64; i++)
            t[i] = n.abs(n.sin(i + 1)) * 4294967296 | 0
    })();
    s = l.MD5 = o.extend({_doReset: function() {
            this._hash = new c.init([1732584193, 4023233417, 2562383102, 271733878])
        },_doProcessBlock: function(n, e) {
            for (var ht, a, v = 0; v < 16; v++)
                ht = e + v, a = n[ht], n[ht] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360;
            var l = this._hash.words, y = n[e + 0], p = n[e + 1], w = n[e + 2], b = n[e + 3], k = n[e + 4], d = n[e + 5], g = n[e + 6], nt = n[e + 7], tt = n[e + 8], it = n[e + 9], rt = n[e + 10], ut = n[e + 11], ft = n[e + 12], et = n[e + 13], ot = n[e + 14], st = n[e + 15], o = l[0], s = l[1], h = l[2], c = l[3];
            o = i(o, s, h, c, y, 7, t[0]);
            c = i(c, o, s, h, p, 12, t[1]);
            h = i(h, c, o, s, w, 17, t[2]);
            s = i(s, h, c, o, b, 22, t[3]);
            o = i(o, s, h, c, k, 7, t[4]);
            c = i(c, o, s, h, d, 12, t[5]);
            h = i(h, c, o, s, g, 17, t[6]);
            s = i(s, h, c, o, nt, 22, t[7]);
            o = i(o, s, h, c, tt, 7, t[8]);
            c = i(c, o, s, h, it, 12, t[9]);
            h = i(h, c, o, s, rt, 17, t[10]);
            s = i(s, h, c, o, ut, 22, t[11]);
            o = i(o, s, h, c, ft, 7, t[12]);
            c = i(c, o, s, h, et, 12, t[13]);
            h = i(h, c, o, s, ot, 17, t[14]);
            s = i(s, h, c, o, st, 22, t[15]);
            o = r(o, s, h, c, p, 5, t[16]);
            c = r(c, o, s, h, g, 9, t[17]);
            h = r(h, c, o, s, ut, 14, t[18]);
            s = r(s, h, c, o, y, 20, t[19]);
            o = r(o, s, h, c, d, 5, t[20]);
            c = r(c, o, s, h, rt, 9, t[21]);
            h = r(h, c, o, s, st, 14, t[22]);
            s = r(s, h, c, o, k, 20, t[23]);
            o = r(o, s, h, c, it, 5, t[24]);
            c = r(c, o, s, h, ot, 9, t[25]);
            h = r(h, c, o, s, b, 14, t[26]);
            s = r(s, h, c, o, tt, 20, t[27]);
            o = r(o, s, h, c, et, 5, t[28]);
            c = r(c, o, s, h, w, 9, t[29]);
            h = r(h, c, o, s, nt, 14, t[30]);
            s = r(s, h, c, o, ft, 20, t[31]);
            o = u(o, s, h, c, d, 4, t[32]);
            c = u(c, o, s, h, tt, 11, t[33]);
            h = u(h, c, o, s, ut, 16, t[34]);
            s = u(s, h, c, o, ot, 23, t[35]);
            o = u(o, s, h, c, p, 4, t[36]);
            c = u(c, o, s, h, k, 11, t[37]);
            h = u(h, c, o, s, nt, 16, t[38]);
            s = u(s, h, c, o, rt, 23, t[39]);
            o = u(o, s, h, c, et, 4, t[40]);
            c = u(c, o, s, h, y, 11, t[41]);
            h = u(h, c, o, s, b, 16, t[42]);
            s = u(s, h, c, o, g, 23, t[43]);
            o = u(o, s, h, c, it, 4, t[44]);
            c = u(c, o, s, h, ft, 11, t[45]);
            h = u(h, c, o, s, st, 16, t[46]);
            s = u(s, h, c, o, w, 23, t[47]);
            o = f(o, s, h, c, y, 6, t[48]);
            c = f(c, o, s, h, nt, 10, t[49]);
            h = f(h, c, o, s, ot, 15, t[50]);
            s = f(s, h, c, o, d, 21, t[51]);
            o = f(o, s, h, c, ft, 6, t[52]);
            c = f(c, o, s, h, b, 10, t[53]);
            h = f(h, c, o, s, rt, 15, t[54]);
            s = f(s, h, c, o, p, 21, t[55]);
            o = f(o, s, h, c, tt, 6, t[56]);
            c = f(c, o, s, h, st, 10, t[57]);
            h = f(h, c, o, s, g, 15, t[58]);
            s = f(s, h, c, o, et, 21, t[59]);
            o = f(o, s, h, c, k, 6, t[60]);
            c = f(c, o, s, h, ut, 10, t[61]);
            h = f(h, c, o, s, w, 15, t[62]);
            s = f(s, h, c, o, it, 21, t[63]);
            l[0] = l[0] + o | 0;
            l[1] = l[1] + s | 0;
            l[2] = l[2] + h | 0;
            l[3] = l[3] + c | 0
        },_doFinalize: function() {
            var o = this._data, f = o.words, c = this._nDataBytes * 8, e = o.sigBytes * 8, t, i, s, h, r, u;
            for (f[e >>> 5] |= 128 << 24 - e % 32, t = n.floor(c / 4294967296), i = c, f[(e + 64 >>> 9 << 4) + 15] = (t << 8 | t >>> 24) & 16711935 | (t << 24 | t >>> 8) & 4278255360, f[(e + 64 >>> 9 << 4) + 14] = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360, o.sigBytes = (f.length + 1) * 4, this._process(), s = this._hash, h = s.words, r = 0; r < 4; r++)
                u = h[r], h[r] = (u << 8 | u >>> 24) & 16711935 | (u << 24 | u >>> 8) & 4278255360;
            return s
        },clone: function() {
            var n = o.clone.call(this);
            return n._hash = this._hash.clone(), n
        }});
    e.MD5 = o._createHelper(s);
    e.HmacMD5 = o._createHmacHelper(s)
}(Math), function(n) {
    var i = CryptoJS, f = i.lib, s = f.WordArray, r = f.Hasher, h = i.algo, e = [], o = [], t, u;
    (function() {
        function u(t) {
            for (var r = n.sqrt(t), i = 2; i <= r; i++)
                if (!(t % i))
                    return !1;
            return !0
        }
        function r(n) {
            return (n - (n | 0)) * 4294967296 | 0
        }
        for (var i = 2, t = 0; t < 64; )
            u(i) && (t < 8 && (e[t] = r(n.pow(i, 1 / 2))), o[t] = r(n.pow(i, 1 / 3)), t++), i++
    })();
    t = [];
    u = h.SHA256 = r.extend({_doReset: function() {
            this._hash = new s.init(e.slice(0))
        },_doProcessBlock: function(n, i) {
            for (var r = this._hash.words, f = r[0], s = r[1], h = r[2], y = r[3], e = r[4], a = r[5], v = r[6], p = r[7], u = 0; u < 64; u++) {
                if (u < 16)
                    t[u] = n[i + u] | 0;
                else {
                    var c = t[u - 15], b = (c << 25 | c >>> 7) ^ (c << 14 | c >>> 18) ^ c >>> 3, l = t[u - 2], k = (l << 15 | l >>> 17) ^ (l << 13 | l >>> 19) ^ l >>> 10;
                    t[u] = b + t[u - 7] + k + t[u - 16]
                }
                var d = e & a ^ ~e & v, g = f & s ^ f & h ^ s & h, nt = (f << 30 | f >>> 2) ^ (f << 19 | f >>> 13) ^ (f << 10 | f >>> 22), tt = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25), w = p + tt + d + o[u] + t[u], it = nt + g;
                p = v;
                v = a;
                a = e;
                e = y + w | 0;
                y = h;
                h = s;
                s = f;
                f = w + it | 0
            }
            r[0] = r[0] + f | 0;
            r[1] = r[1] + s | 0;
            r[2] = r[2] + h | 0;
            r[3] = r[3] + y | 0;
            r[4] = r[4] + e | 0;
            r[5] = r[5] + a | 0;
            r[6] = r[6] + v | 0;
            r[7] = r[7] + p | 0
        },_doFinalize: function() {
            var r = this._data, t = r.words, u = this._nDataBytes * 8, i = r.sigBytes * 8;
            return t[i >>> 5] |= 128 << 24 - i % 32, t[(i + 64 >>> 9 << 4) + 14] = n.floor(u / 4294967296), t[(i + 64 >>> 9 << 4) + 15] = u, r.sigBytes = t.length * 4, this._process(), this._hash
        },clone: function() {
            var n = r.clone.call(this);
            return n._hash = this._hash.clone(), n
        }});
    i.SHA256 = r._createHelper(u);
    i.HmacSHA256 = r._createHmacHelper(u)
}(Math), function() {
    var n = CryptoJS, t = n.lib, i = t.WordArray, r = n.enc, u = r.Base64 = {stringify: function(n) {
            var u = n.words, e = n.sigBytes, o = this._map, i, t, r, f;
            for (n.clamp(), i = [], t = 0; t < e; t += 3) {
                var s = u[t >>> 2] >>> 24 - t % 4 * 8 & 255, h = u[t + 1 >>> 2] >>> 24 - (t + 1) % 4 * 8 & 255, c = u[t + 2 >>> 2] >>> 24 - (t + 2) % 4 * 8 & 255, l = s << 16 | h << 8 | c;
                for (r = 0; r < 4 && t + r * .75 < e; r++)
                    i.push(o.charAt(l >>> 6 * (3 - r) & 63))
            }
            if (f = o.charAt(64), f)
                while (i.length % 4)
                    i.push(f);
            return i.join("")
        },parse: function(n) {
            var o = n.length, u = this._map, s = u.charAt(64), f, e, r, t, h, c;
            for (s && (f = n.indexOf(s), f != -1 && (o = f)), e = [], r = 0, t = 0; t < o; t++)
                t % 4 && (h = u.indexOf(n.charAt(t - 1)) << t % 4 * 2, c = u.indexOf(n.charAt(t)) >>> 6 - t % 4 * 2, e[r >>> 2] |= (h | c) << 24 - r % 4 * 8, r++);
            return i.create(e, r)
        },_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}
}()
